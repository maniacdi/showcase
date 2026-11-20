import { describe, expect, it } from "vitest";
import { productosSeed } from "@/data/productos";
import { citasCSV, csvFormat, ordersCSV, productosCSV } from "./adminExport";
import { computeTotals, type Order } from "./checkout";
import { CSV_BOM, escapeCsvCell, toCSV } from "./csv";

describe("toCSV", () => {
  it("starts with a UTF-8 BOM, uses ; and CRLF line ends", () => {
    expect(
      toCSV([
        ["a", "b"],
        [1, 2],
      ]),
    ).toBe(`${CSV_BOM}a;b\r\n1;2\r\n`);
  });

  it("keeps accents as-is (the BOM makes Excel read them)", () => {
    expect(toCSV([["Revisión", "Móviles"]])).toBe(`${CSV_BOM}Revisión;Móviles\r\n`);
  });

  it("quotes cells with the separator, quotes, newlines or edge spaces", () => {
    expect(escapeCsvCell("a;b")).toBe('"a;b"');
    expect(escapeCsvCell('dice "hola"')).toBe('"dice ""hola"""');
    expect(escapeCsvCell("dos\nlíneas")).toBe('"dos\nlíneas"');
    expect(escapeCsvCell("a,b")).toBe("a,b");
    expect(escapeCsvCell("a,b", ",")).toBe('"a,b"');
    expect(escapeCsvCell(" pad ")).toBe('" pad "');
  });

  it("empty for null/undefined, numbers as-is", () => {
    expect(escapeCsvCell(null)).toBe("");
    expect(escapeCsvCell(undefined)).toBe("");
    expect(escapeCsvCell(-3)).toBe("-3");
  });

  it("neutralises spreadsheet formulas but not negative numbers", () => {
    expect(escapeCsvCell('=HYPERLINK("x")')).toBe(`"'=HYPERLINK(""x"")"`);
    expect(escapeCsvCell("+34 600")).toBe("'+34 600");
    expect(escapeCsvCell("@SUM")).toBe("'@SUM");
    expect(escapeCsvCell("-12,50")).toBe("-12,50");
  });
});

describe("admin exports", () => {
  it("Spanish format: semicolons and decimal comma", () => {
    const csv = productosCSV(
      productosSeed.slice(0, 1),
      ["ID", "Slug", "Producto", "Categoría", "Precio", "Stock", "Activo", "Visitas"],
      (b) => (b ? "Sí" : "No"),
      { p1: 42 },
      csvFormat("es"),
    );
    const [header, row] = csv.slice(1).split("\r\n");
    expect(csv.charCodeAt(0)).toBe(0xfeff);
    expect(header).toBe("ID;Slug;Producto;Categoría;Precio;Stock;Activo;Visitas");
    // The name contains a quote → quoted, with the inner quote doubled.
    expect(row).toBe(`p1;smartphone-pro;"Smartphone Pro 6,3""";Móviles;999,00;18;Sí;42`);
  });

  it("English format: commas and decimal point", () => {
    const lines = [{ id: "p1", name: "Phone, black", price: 10.5, qty: 2 }];
    const order = {
      number: "SC-1",
      fecha: "2026-07-02",
      cliente: "Ana",
      ciudad: "Santander",
      lines,
      totals: computeTotals(lines, "recogida"),
      entrega: "2026-07-06",
    } as Order;
    const csv = ordersCSV(
      [order],
      ["n"],
      () => "Pick-up",
      () => "Card",
      csvFormat("en"),
    );
    expect(csv).toContain(
      `SC-1,2026-07-02,Ana,Santander,"2 x Phone, black",Pick-up,Card,17.36,3.64,21.00,2026-07-06`,
    );
  });

  it("citas rows split date and time", () => {
    const csv = citasCSV(
      [
        {
          id: "c1",
          cliente: "Ana",
          servicio: "Revisión",
          fecha: "2026-07-02T10:30",
          estado: "pendiente",
        },
      ],
      ["h"],
      () => "Pendiente",
      () => "",
      csvFormat("es"),
    );
    expect(csv).toContain("c1;Ana;Revisión;2026-07-02;10:30;Pendiente;;\r\n");
  });
});
