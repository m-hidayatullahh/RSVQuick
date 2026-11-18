import { useTranslate } from "@refinedev/core";
import LegalShell from "./legal-shell";
import Seo from "../../components/seo";

export default function TermsOfServicePage() {
  const t = useTranslate();
  return (
    <LegalShell title={t("pages.terms.title")}>
      <Seo
        title={t("pages.terms.title")}
        description={t("pages.terms.intro")}
      />

      <p>{t("pages.terms.intro")}</p>

      <h2>{t("pages.terms.s1.title")}</h2>
      <ul>
        <li>{t("pages.terms.s1.item1")}</li>
        <li>{t("pages.terms.s1.item2")}</li>
        <li>{t("pages.terms.s1.item3")}</li>
      </ul>

      <h2>{t("pages.terms.s2.title")}</h2>
      <p>{t("pages.terms.s2.body")}</p>
      <p>{t("pages.terms.s2.prohibited")}</p>
      <ul>
        <li>{t("pages.terms.s2.item1")}</li>
        <li>{t("pages.terms.s2.item2")}</li>
        <li>{t("pages.terms.s2.item3")}</li>
        <li>{t("pages.terms.s2.item4")}</li>
      </ul>

      <h2>{t("pages.terms.s3.title")}</h2>
      <ul>
        <li>{t("pages.terms.s3.item1")}</li>
        <li>{t("pages.terms.s3.item2")}</li>
        <li>{t("pages.terms.s3.item3")}</li>
      </ul>

      <h2>{t("pages.terms.s4.title")}</h2>
      <p>{t("pages.terms.s4.body")}</p>

      <h2>{t("pages.terms.s5.title")}</h2>
      <p>{t("pages.terms.s5.body")}</p>

      <h2>{t("pages.terms.s6.title")}</h2>
      <p>{t("pages.terms.s6.body")}</p>

      <h2>{t("pages.terms.s7.title")}</h2>
      <p>{t("pages.terms.s7.body")}</p>

      <h2>{t("pages.terms.s8.title")}</h2>
      <p>{t("pages.terms.s8.body")}</p>

      <h2>{t("pages.terms.s9.title")}</h2>
      <p>{t("pages.terms.s9.body")}</p>

      <h2>{t("pages.terms.s10.title")}</h2>
      <p>{t("pages.terms.s10.body")}</p>
    </LegalShell>
  );
}
