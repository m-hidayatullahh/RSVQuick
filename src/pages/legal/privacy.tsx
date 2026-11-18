import { useTranslate } from "@refinedev/core";
import LegalShell from "./legal-shell";
import Seo from "../../components/seo";

export default function PrivacyPolicyPage() {
  const t = useTranslate();
  return (
    <LegalShell title={t("pages.privacy.title")}>
      <Seo
        title={t("pages.privacy.title")}
        description={t("pages.privacy.intro")}
      />

      <p>{t("pages.privacy.intro")}</p>

      <h2>{t("pages.privacy.s1.title")}</h2>
      <ul>
        <li>{t("pages.privacy.s1.item1")}</li>
        <li>{t("pages.privacy.s1.item2")}</li>
        <li>{t("pages.privacy.s1.item3")}</li>
      </ul>

      <h2>{t("pages.privacy.s2.title")}</h2>
      <ul>
        <li>{t("pages.privacy.s2.item1")}</li>
        <li>{t("pages.privacy.s2.item2")}</li>
        <li>{t("pages.privacy.s2.item3")}</li>
        <li>{t("pages.privacy.s2.item4")}</li>
      </ul>

      <h2>{t("pages.privacy.s3.title")}</h2>
      <p>{t("pages.privacy.s3.body")}</p>

      <h2>{t("pages.privacy.s4.title")}</h2>
      <p>{t("pages.privacy.s4.body")}</p>

      <h2>{t("pages.privacy.s5.title")}</h2>
      <ul>
        <li>{t("pages.privacy.s5.item1")}</li>
        <li>{t("pages.privacy.s5.item2")}</li>
        <li>{t("pages.privacy.s5.item3")}</li>
      </ul>

      <h2>{t("pages.privacy.s6.title")}</h2>
      <p>{t("pages.privacy.s6.body")}</p>

      <h2>{t("pages.privacy.s7.title")}</h2>
      <p>{t("pages.privacy.s7.body")}</p>

      <h2>{t("pages.privacy.s8.title")}</h2>
      <p>{t("pages.privacy.s8.body")}</p>
    </LegalShell>
  );
}
