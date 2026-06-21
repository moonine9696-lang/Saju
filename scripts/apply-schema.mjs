/**
 * supabase/schema.sql 을 DB에 적용하는 일회성 러너.
 * 접속 정보는 환경변수로만 받는다 (이 파일에 비밀번호를 절대 적지 않음).
 *
 * 실행 예:
 *   DB_HOST=... DB_USER=postgres DB_PASS='...' DB_NAME=postgres node scripts/apply-schema.mjs
 */
import pg from "pg";
import { readFileSync } from "node:fs";

const { Client } = pg;
const sql = readFileSync(new URL("../supabase/schema.sql", import.meta.url), "utf8");

const client = new Client({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 5432),
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  ssl: { rejectUnauthorized: false }, // Supabase는 SSL 필요
});

try {
  await client.connect();
  console.log("접속 성공. schema.sql 실행 중...");
  await client.query(sql);
  console.log("schema.sql 실행 완료.\n");

  const tables = await client.query(
    `select table_name from information_schema.tables
     where table_schema='public' and table_name in ('orders','match_registrations')
     order by table_name`
  );
  console.log("== public 스키마 테이블 ==");
  for (const r of tables.rows) console.log("  -", r.table_name);

  const cols = await client.query(
    `select column_name, data_type, is_nullable
     from information_schema.columns
     where table_schema='public' and table_name='orders'
     order by ordinal_position`
  );
  console.log("\n== orders 컬럼 ==");
  for (const c of cols.rows) {
    console.log(`  ${c.column_name} : ${c.data_type} ${c.is_nullable === "YES" ? "(null 허용)" : "(not null)"}`);
  }

  const hasQuestion = cols.rows.some((c) => c.column_name === "question");
  console.log("\n== 확인 결과 ==");
  console.log("  orders 테이블 존재:", tables.rows.some((r) => r.table_name === "orders"));
  console.log("  question 컬럼 존재:", hasQuestion);

  const rls = await client.query(
    `select relname, relrowsecurity from pg_class
     where relname in ('orders','match_registrations')`
  );
  console.log("  RLS 활성화:", rls.rows.map((r) => `${r.relname}=${r.relrowsecurity}`).join(", "));
} catch (e) {
  console.error("실패:", e.message);
  process.exitCode = 1;
} finally {
  await client.end();
}
