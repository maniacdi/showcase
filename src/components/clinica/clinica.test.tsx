import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NextIntlClientProvider } from "next-intl";
import { beforeEach, describe, expect, it } from "vitest";
import BookingFlow from "@/app/[locale]/reservas/BookingFlow";
import { citasSeed } from "@/data/citas";
import es from "@/messages/es.json";
import { useCitasStore } from "@/store/useCitasStore";
import AdminAgenda from "./AdminAgenda";

function wrap(ui: React.ReactNode) {
  return render(
    <NextIntlClientProvider locale="es" messages={es} timeZone="Europe/Madrid">
      {ui}
    </NextIntlClientProvider>,
  );
}

beforeEach(() => {
  sessionStorage.clear();
  window.history.replaceState(null, "", "/reservas");
  useCitasStore.setState({ citas: citasSeed.map((c) => ({ ...c })) });
});

describe("BookingFlow (clinic agenda)", () => {
  it("walks servicio → profesional → día → hora → datos and shows the reminder", async () => {
    const user = userEvent.setup();
    wrap(<BookingFlow />);

    expect(screen.getByText("Paso 1 de 5")).toBeInTheDocument();
    await user.click(screen.getByRole("radio", { name: /Revisión/ }));
    await user.click(screen.getByRole("button", { name: "Continuar" }));

    await user.click(screen.getByRole("radio", { name: /Elena Marín/ }));
    await user.click(screen.getByRole("button", { name: "Continuar" }));

    // Elena works Mon–Fri: Saturday 4 July is disabled.
    const day = screen.getByRole("group", { name: "¿Qué día te viene bien?" });
    expect(within(day).getByRole("radio", { name: /sáb 4 jul/ })).toBeDisabled();
    await user.click(within(day).getByRole("radio", { name: /jue 2 jul/ }));
    await user.click(screen.getByRole("button", { name: "Continuar" }));

    // Seed: Elena busy 10:00–10:45 and 11:30–12:00 on 2 July.
    const times = screen.getByRole("group", { name: "¿A qué hora?" });
    expect(within(times).queryByRole("radio", { name: "10:00" })).toBeNull();
    expect(within(times).queryByRole("radio", { name: "11:30" })).toBeNull();
    await user.click(within(times).getByRole("radio", { name: "09:00" }));
    await user.click(screen.getByRole("button", { name: "Continuar" }));

    await user.type(screen.getByLabelText("Nombre"), "Ana Prueba");
    await user.type(screen.getByLabelText("Email"), "ana@example.com");
    await user.type(screen.getByLabelText("Teléfono para el recordatorio"), "600123456");
    await user.click(screen.getByRole("button", { name: "Reservar" }));

    expect(screen.getByText("¡Cita reservada!")).toBeInTheDocument();
    expect(screen.getByText(/Te recordamos tu cita de Revisión con Elena Marín/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Añadir a mi calendario" })).toBeInTheDocument();
    const booked = useCitasStore.getState().citas.at(-1)!;
    expect(booked).toMatchObject({ fecha: "2026-07-02T09:00", profesionalId: "elena", duracion: 30 });
  }, 20_000); // many user-event steps; slow under a full parallel run

  it("cancel from the manage link frees the slot", async () => {
    const user = userEvent.setup();
    const created = useCitasStore.getState().book({
      cliente: "Ana",
      servicio: "Revisión",
      fecha: "2026-07-06T09:00",
      profesionalId: "elena",
      duracion: 30,
    });
    window.history.replaceState(null, "", `/reservas?cita=${created.id}`);
    wrap(<BookingFlow />);

    await user.click(await screen.findByRole("button", { name: "Cancelar cita" }));
    expect(screen.getByText("Cita cancelada")).toBeInTheDocument();
    expect(useCitasStore.getState().citas.find((c) => c.id === created.id)?.estado).toBe("cancelada");
  });
});

describe("AdminAgenda", () => {
  it("shows the no-show rate (sample data) and marks attendance", async () => {
    const user = userEvent.setup();
    wrap(<AdminAgenda />);

    expect(screen.getByText("Tasa de no presentados")).toBeInTheDocument();
    expect(screen.getByText("Datos de ejemplo")).toBeInTheDocument();
    const before = screen.getByText(/de \d+ citas con asistencia marcada/).textContent;

    const mark = screen.getByRole("button", { name: "No se presentó: Juan Pérez, 11:30" });
    await user.click(mark);
    expect(mark).toHaveAttribute("aria-pressed", "true");
    expect(useCitasStore.getState().citas.find((c) => c.id === "c2")?.estado).toBe("no_presentado");
    expect(screen.getByText(/de \d+ citas con asistencia marcada/).textContent).not.toBe(before);

    await user.click(screen.getByRole("button", { name: "Semana" }));
    expect(screen.getByRole("table")).toBeInTheDocument();
  });
});
