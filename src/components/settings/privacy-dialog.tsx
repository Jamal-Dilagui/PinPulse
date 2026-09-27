"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Shield,
  Lock,
  Database,
  Cookie,
  Eye,
  Trash2,
  ExternalLink,
  KeyRound,
  Server,
  UserCheck,
  Mail,
  FileText,
} from "lucide-react";

interface PrivacyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const SECTIONS = [
  {
    id: "responsable",
    icon: UserCheck,
    title: "Responsable du traitement",
    badge: "Article 13 RGPD",
    body: (
      <div className="space-y-2 text-sm leading-relaxed">
        <p>
          Le responsable du traitement des données personnelles dans le cadre
          de PinPulse est l&apos;utilisateur lui-même, dans la mesure où
          l&apos;application s&apos;exécute localement sur son navigateur et
          que toutes les données de configuration sont stockées exclusivement
          sur son appareil.
        </p>
        <p>
          PinPulse n&apos;opère aucun serveur centralisé de collecte. Aucune
          donnée n&apos;est transmise à un tiers sans action explicite de votre
          part.
        </p>
      </div>
    ),
  },
  {
    id: "donnees",
    icon: Database,
    title: "Données collectées et stockées",
    badge: "Local",
    body: (
      <div className="space-y-3 text-sm leading-relaxed">
        <p>L&apos;application stocke localement (localStorage du navigateur) :</p>
        <ul className="list-disc pl-5 space-y-1.5">
          <li>
            <strong>Clé API Pinterest et App ID</strong> — saisis par vous dans
            les paramètres, uniquement pour authentifier les appels à
            l&apos;API Pinterest.
          </li>
          <li>
            <strong>App Secret (optionnel)</strong> — chiffré uniquement en
            mémoire si vous choisissez de le fournir.
          </li>
          <li>
            <strong>Liste des comptes Pinterest suivis</strong> — nom
            d&apos;utilisateur, nom d&apos;affichage, identifiants internes.
          </li>
          <li>
            <strong>Préférences</strong> — intervalle d&apos;actualisation,
            plage de dates par défaut, mode Live/Démo.
          </li>
          <li>
            <strong>Métriques agrégées</strong> — impressions, sauvegardes,
            clics sortants et réactions récupérés depuis l&apos;API Pinterest.
          </li>
        </ul>
        <p className="text-xs text-muted-foreground mt-2">
          Ces données ne quittent jamais votre navigateur sauf lors des appels
          directs à l&apos;API Pinterest (voir section suivante).
        </p>
      </div>
    ),
  },
  {
    id: "api-pinterest",
    icon: ExternalLink,
    title: "Transferts vers l'API Pinterest",
    badge: "Tiers",
    body: (
      <div className="space-y-2 text-sm leading-relaxed">
        <p>
          En mode <Badge className="text-[10px] bg-emerald-100 text-emerald-700 hover:bg-emerald-100">Live</Badge>,
          PinPulse envoie directement à l&apos;API Pinterest (api.pinterest.com)
          votre clé d&apos;accès afin de récupérer les métriques de vos comptes.
          Ces requêtes sont effectuées depuis votre navigateur vers les serveurs
          de Pinterest, et sont régies par la politique de confidentialité de
          Pinterest accessible à{" "}
          <a
            href="https://policy.pinterest.com/fr/privacy-policy"
            target="_blank"
            rel="noreferrer noopener"
            className="font-medium underline inline-flex items-center gap-0.5"
          >
            policy.pinterest.com <ExternalLink className="h-3 w-3" />
          </a>.
        </p>
        <p>
          En mode <Badge variant="outline" className="text-[10px]">Démo</Badge>,
          aucune donnée n&apos;est transmise à Pinterest. L&apos;application
          utilise des données simulées déterministes.
        </p>
      </div>
    ),
  },
  {
    id: "cookies",
    icon: Cookie,
    title: "Cookies et technologies similaires",
    badge: "Aucun tracker",
    body: (
      <div className="space-y-2 text-sm leading-relaxed">
        <p>
          PinPulse n&apos;utilise <strong>aucun cookie publicitaire, ni
          tracker tiers</strong>. L&apos;application utilise uniquement :
        </p>
        <ul className="list-disc pl-5 space-y-1.5">
          <li>
            <code className="rounded bg-muted px-1 text-xs">localStorage</code>{" "}
            pour persister les paramètres et identifiants entre les sessions.
          </li>
          <li>
            Les mécanismes standards de Next.js pour la gestion de session
            technique (aucune donnée personnelle).
          </li>
        </ul>
        <p>
          Aucune donnée de navigation n&apos;est partagée avec des services
          d&apos;analytics ou de publicité.
        </p>
      </div>
    ),
  },
  {
    id: "securite",
    icon: Lock,
    title: "Sécurité des données",
    badge: "Bonnes pratiques",
    body: (
      <div className="space-y-2 text-sm leading-relaxed">
        <p>
          Vos identifiants API sont stockés dans le{" "}
          <code className="rounded bg-muted px-1 text-xs">localStorage</code>{" "}
          de votre navigateur, accessible uniquement depuis l&apos;origine de
          l&apos;application. Pour renforcer la sécurité :
        </p>
        <ul className="list-disc pl-5 space-y-1.5">
          <li>Le champ App Secret est masqué par défaut dans l&apos;interface.</li>
          <li>
            Aucune donnée d&apos;identification n&apos;est journalisée dans la
            console ou envoyée à un service externe.
          </li>
          <li>
            Les appels à l&apos;API Pinterest transitent par HTTPS.
          </li>
          <li>
            Vous pouvez à tout moment révoquer vos jetons depuis le tableau de
            bord développeur Pinterest.
          </li>
        </ul>
        <p className="text-xs text-amber-700 dark:text-amber-300 mt-2">
          ⚠ Ne partagez jamais votre clé d&apos;accès. En cas de compromission,
          révoquez-la immédiatement sur developers.pinterest.com.
        </p>
      </div>
    ),
  },
  {
    id: "duree",
    icon: Server,
    title: "Durée de conservation",
    badge: "Maîtrise utilisateur",
    body: (
      <div className="space-y-2 text-sm leading-relaxed">
        <p>
          Les données stockées localement sont conservées tant que vous
          n&apos;effectuez pas l&apos;une des actions suivantes :
        </p>
        <ul className="list-disc pl-5 space-y-1.5">
          <li>
            Clic sur <strong>Réinitialiser</strong> dans les paramètres (efface
            la clé API et restaure les comptes de démonstration).
          </li>
          <li>
            Vidage du <code className="rounded bg-muted px-1 text-xs">localStorage</code>{" "}
            via les outils de votre navigateur.
          </li>
          <li>
            Suppression manuelle d&apos;un compte dans l&apos;onglet
            <em> Comptes</em> des paramètres.
          </li>
        </ul>
      </div>
    ),
  },
  {
    id: "droits",
    icon: Eye,
    title: "Vos droits (RGPD / Loi 09-08)",
    badge: "Inviolables",
    body: (
      <div className="space-y-2 text-sm leading-relaxed">
        <p>
          Conformément au Règlement Général sur la Protection des Données (UE)
          et à la loi marocaine 09-08 relative à la protection des personnes
          physiques à l&apos;égard du traitement des données à caractère
          personnel, vous disposez des droits suivants :
        </p>
        <ul className="list-disc pl-5 space-y-1.5">
          <li><strong>Droit d&apos;accès</strong> à vos données (consultables directement dans les paramètres).</li>
          <li><strong>Droit de rectification</strong> des informations associées à vos comptes.</li>
          <li><strong>Droit à l&apos;effacement</strong> (« droit à l&apos;oubli ») via la fonction Réinitialiser.</li>
          <li><strong>Droit à la portabilité</strong> — vos données peuvent être exportées.</li>
          <li><strong>Droit d&apos;opposition</strong> au traitement par désactivation du mode Live.</li>
        </ul>
        <p>
          Pour exercer ces droits concernant les données traitées par
          Pinterest, contactez directement Pinterest via leur formulaire de
          confidentialité.
        </p>
      </div>
    ),
  },
  {
    id: "suppression",
    icon: Trash2,
    title: "Comment supprimer vos données",
    badge: "Immédiat",
    body: (
      <div className="space-y-2 text-sm leading-relaxed">
        <p>Pour supprimer immédiatement toutes vos données de PinPulse :</p>
        <ol className="list-decimal pl-5 space-y-1.5">
          <li>
            Ouvrez les <strong>Paramètres</strong> → onglet{" "}
            <strong>Préférences</strong>.
          </li>
          <li>
            Cliquez sur <strong>Réinitialiser</strong> — toutes les clés API,
            comptes et préférences sont effacés du navigateur.
          </li>
          <li>
            (Optionnel) Dans votre navigateur, ouvrez les outils développeur →
            Application → Local Storage → supprimez la clé{" "}
            <code className="rounded bg-muted px-1 text-xs">pinterest-dashboard-settings</code>.
          </li>
        </ol>
        <p className="text-xs text-muted-foreground mt-2">
          Cette action est irréversible. Les données ne peuvent pas être
          récupérées une fois supprimées.
        </p>
      </div>
    ),
  },
  {
    id: "contact",
    icon: Mail,
    title: "Contact et réclamations",
    badge: "Support",
    body: (
      <div className="space-y-2 text-sm leading-relaxed">
        <p>
          Pour toute question relative à la présente politique de
          confidentialité ou pour exercer vos droits, vous pouvez :
        </p>
        <ul className="list-disc pl-5 space-y-1.5">
          <li>
            Consulter la documentation Pinterest à{" "}
            <a
              href="https://developers.pinterest.com/docs/api/v5/"
              target="_blank"
              rel="noreferrer noopener"
              className="font-medium underline inline-flex items-center gap-0.5"
            >
              developers.pinterest.com <ExternalLink className="h-3 w-3" />
            </a>
          </li>
          <li>
            Déposer une réclamation auprès de la CNDP Maroc (Commission
            Nationale de contrôle de la Protection des Données à caractère
            Personnel) à{" "}
            <a
              href="https://www.cndp.ma"
              target="_blank"
              rel="noreferrer noopener"
              className="font-medium underline inline-flex items-center gap-0.5"
            >
              cndp.ma <ExternalLink className="h-3 w-3" />
            </a>
          </li>
        </ul>
      </div>
    ),
  },
];

export function PrivacyDialog({ open, onOpenChange }: PrivacyDialogProps) {
  const lastUpdated = "28 septembre 2026";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl gap-0 p-0 overflow-hidden max-h-[90vh]">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-border bg-gradient-to-br from-primary/5 to-card">
          <DialogTitle className="flex items-center gap-2 text-lg">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-primary text-primary-foreground shadow-sm">
              <Shield className="h-5 w-5" />
            </div>
            Politique de Confidentialité
          </DialogTitle>
          <DialogDescription className="flex items-center gap-2 flex-wrap">
            <span>PinPulse · Tableau de bord Pinterest Analytics</span>
            <Badge variant="outline" className="text-[10px] gap-1">
              <FileText className="h-3 w-3" />
              Mis à jour le {lastUpdated}
            </Badge>
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[70vh]">
          <div className="px-6 py-5 space-y-4">
            {/* Intro summary */}
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 dark:bg-emerald-950/30 dark:border-emerald-900">
              <div className="flex items-start gap-2.5">
                <Shield className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <div className="text-sm leading-relaxed">
                  <div className="font-semibold text-emerald-800 dark:text-emerald-200 mb-1">
                    Résumé en une phrase
                  </div>
                  <p className="text-emerald-900/80 dark:text-emerald-100/80">
                    PinPulse est conçu avec une approche{" "}
                    <strong>privacy-first</strong> : toutes vos données restent
                    dans votre navigateur, aucune publicité ni tracker tiers,
                    et vous gardez le contrôle total via la fonction
                    Réinitialiser.
                  </p>
                </div>
              </div>
            </div>

            {/* Principles row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <PrincipleCard
                icon={Lock}
                label="100% Local"
                hint="Vos données restent sur votre appareil"
              />
              <PrincipleCard
                icon={Cookie}
                label="0 Tracker"
                hint="Aucun cookie publicitaire"
              />
              <PrincipleCard
                icon={KeyRound}
                label="Vos clés"
                hint="API key sous votre contrôle"
              />
              <PrincipleCard
                icon={Trash2}
                label="Effaçable"
                hint="Suppression en 1 clic"
              />
            </div>

            {/* Detailed sections */}
            <Accordion
              type="multiple"
              defaultValue={["donnees"]}
              className="rounded-xl border border-border bg-card"
            >
              {SECTIONS.map((section) => {
                const Icon = section.icon;
                return (
                  <AccordionItem
                    key={section.id}
                    value={section.id}
                    className="border-b border-border last:border-b-0"
                  >
                    <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-muted/30">
                      <div className="flex items-center gap-3 flex-1">
                        <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="flex-1 text-left">
                          <div className="text-sm font-medium">
                            {section.title}
                          </div>
                        </div>
                        <Badge
                          variant="outline"
                          className="text-[10px] hidden sm:inline-flex"
                        >
                          {section.badge}
                        </Badge>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-4 pb-4 pt-0">
                      <div className="pl-11">{section.body}</div>
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>

            {/* Footer note */}
            <div className="rounded-lg bg-muted/40 p-3 text-[11px] text-muted-foreground text-center">
              Cette politique s&apos;applique uniquement à l&apos;application
              PinPulse. L&apos;utilisation de l&apos;API Pinterest reste soumise
              aux conditions de Pinterest Inc.
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

function PrincipleCard({
  icon: Icon,
  label,
  hint,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  hint: string;
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-3 text-center">
      <div className="mx-auto grid h-8 w-8 place-items-center rounded-lg bg-primary/10 text-primary">
        <Icon className="h-4 w-4" />
      </div>
      <div className="mt-1.5 text-xs font-semibold">{label}</div>
      <div className="text-[10px] text-muted-foreground leading-tight mt-0.5">
        {hint}
      </div>
    </div>
  );
}
