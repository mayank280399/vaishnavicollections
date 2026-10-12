import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import ts from "typescript";

const source = await readFile(new URL("../lib/sitemap-utils.ts", import.meta.url), "utf8");
const compiled = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.ES2022, target: ts.ScriptTarget.ES2022 },
}).outputText;
const { buildSitemapEntries } = await import(
  `data:text/javascript;base64,${Buffer.from(compiled).toString("base64")}`
);

const category = (values = {}) => ({
  id: "root", slug: "cosmetics-beauty", parent_id: null, updated_at: null,
  category_type: "PRODUCT", active: true, show_subcategory: false, ...values,
});
const product = (values = {}) => ({
  id: "p1", slug: "eyeliner", category_id: "root", updated_at: null,
  visibility: "PUBLISHED", online_enabled: true, hasPublicImage: true, ...values,
});
const urlsFor = (categories, products) => buildSitemapEntries({
  siteUrl: "https://example.test", categories, products,
}).map(({ url }) => url);

test("includes only directly routable active collections with visible subcategories", () => {
  const root = category();
  const child = category({ id: "child", slug: "eyeliner", parent_id: "root", show_subcategory: true });
  const hiddenChild = category({ id: "hidden", slug: "hidden", parent_id: "root", show_subcategory: false });
  const grandchild = category({ id: "grand", slug: "grand", parent_id: "child", show_subcategory: true });
  const urls = urlsFor([root, child, hiddenChild, grandchild], [
    product({ id: "root-product" }),
    product({ id: "child-product", slug: "liner", category_id: "child" }),
    product({ id: "hidden-product", slug: "hidden-item", category_id: "hidden" }),
    product({ id: "grand-product", slug: "grand-item", category_id: "grand" }),
  ]);

  assert.ok(urls.includes("https://example.test/collections/cosmetics-beauty"));
  assert.ok(urls.includes("https://example.test/collections/cosmetics-beauty/eyeliner"));
  assert.ok(!urls.includes("https://example.test/collections/cosmetics-beauty/hidden"));
  assert.ok(!urls.includes("https://example.test/collections/eyeliner/grand"));
});

test("does not emit the reported eyeliner URL when that child is hidden", () => {
  const urls = urlsFor([
    category(),
    category({ id: "eyeliner", slug: "eyeliner", parent_id: "root", show_subcategory: false }),
  ], [product({ id: "eyeliner-product", category_id: "eyeliner" })]);

  assert.ok(!urls.includes("https://example.test/collections/cosmetics-beauty/eyeliner"));
});

test("excludes unavailable categories and malformed, hidden, or ambiguous product URLs", () => {
  const urls = urlsFor([
    category({ id: "inactive", slug: "inactive", active: false }),
    category({ id: "nonproduct", slug: "nonproduct", category_type: "SERVICE" }),
    category({ id: "bad", slug: "bad/path" }),
    category({ id: "empty", slug: "empty" }),
  ], [
    product({ id: "draft", slug: "draft", visibility: "DRAFT" }),
    product({ id: "offline", slug: "offline", online_enabled: false }),
    product({ id: "no-image", slug: "no-image", hasPublicImage: false }),
    product({ id: "dup-a", slug: "duplicate" }),
    product({ id: "dup-b", slug: "duplicate" }),
    product({ id: "bad-slug", slug: "../bad" }),
  ]);

  assert.ok(!urls.some((url) => url.includes("/collections/")));
  assert.ok(!urls.includes("https://example.test/products/draft"));
  assert.ok(!urls.includes("https://example.test/products/offline"));
  assert.ok(!urls.includes("https://example.test/products/duplicate"));
  assert.ok(!urls.includes("https://example.test/products/../bad"));
  assert.ok(urls.includes("https://example.test/products/no-image"));
});

test("includes canonical static pages and valid public products exactly once", () => {
  const urls = urlsFor([], [
    product({ updated_at: "2026-01-02T03:04:05Z" }),
    product({ id: "out-of-stock", slug: "out-of-stock", stock_quantity: 0 }),
  ]);

  assert.ok(urls.includes("https://example.test/"));
  assert.ok(urls.includes("https://example.test/refund-returns"));
  assert.ok(urls.includes("https://example.test/products/eyeliner"));
  assert.ok(urls.includes("https://example.test/products/out-of-stock"));
  assert.equal(new Set(urls).size, urls.length);
  assert.ok(!urls.some((url) => /\/(admin|account|checkout|login)(\/|$)/.test(url)));
});
