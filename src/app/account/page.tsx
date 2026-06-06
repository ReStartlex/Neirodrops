import type { Metadata } from "next";
import { AccountClient } from "@/components/AccountClient";

export const metadata: Metadata = {
  title: "Личный кабинет",
  description: "Баланс, пополнение и история заказов NeuroDrop.",
  robots: { index: false, follow: false },
  alternates: { canonical: "/account" },
};

export default function AccountPage() {
  return (
    <section className="section">
      <div className="container">
        <AccountClient />
      </div>
    </section>
  );
}
