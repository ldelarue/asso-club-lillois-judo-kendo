import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import type { PDFFont, PDFPage } from "pdf-lib";

export const INSCRIPTION_TEMPLATE_FILENAME_PREFIX = "DEMANDE INSCRIPTION";

export const DISCIPLINES = [
  "judo",
  "kendo",
  "iaido",
  "aikido",
  "jodo",
] as const;

export type Discipline = (typeof DISCIPLINES)[number];

export interface InscriptionData {
  disciplines: Discipline[];
  nom: string;
  prenom: string;
  dateNaissance: string;
  lieuNaissance: string;
  adresse: string;
  courriel: string;
  telephone: string;
  nationalite: string;
  profession: string;
  grades: string;
  numeroLicence: string;
  droitImage: boolean;
  whatsapp: boolean;
  autorisationParentale: boolean;
  responsableNom: string;
  enfantNom: string;
  enfantDateNaissance: string;
}

interface TextPosition {
  x: number;
  y: number;
  maxWidth: number;
  size?: number;
}

const A4_TEMPLATE = { width: 595.32, height: 841.92 };

// Coordinates use PDF points from the bottom-left of the immutable A4 template.
const TEXT_POSITIONS: Record<
  Exclude<
    keyof InscriptionData,
    "disciplines" | "droitImage" | "whatsapp" | "autorisationParentale"
  >,
  TextPosition
> = {
  nom: { x: 135, y: 557, maxWidth: 115 },
  prenom: { x: 349, y: 557, maxWidth: 210 },
  dateNaissance: { x: 142, y: 540, maxWidth: 108 },
  lieuNaissance: { x: 298, y: 540, maxWidth: 261 },
  adresse: { x: 146, y: 523, maxWidth: 413 },
  courriel: { x: 142, y: 507, maxWidth: 417 },
  telephone: { x: 147, y: 491, maxWidth: 103 },
  nationalite: { x: 337, y: 491, maxWidth: 222 },
  profession: { x: 143, y: 475, maxWidth: 107 },
  grades: { x: 313, y: 475, maxWidth: 246 },
  numeroLicence: { x: 200, y: 459, maxWidth: 359 },
  responsableNom: { x: 132, y: 260, maxWidth: 220 },
  enfantNom: { x: 72, y: 244, maxWidth: 137 },
  enfantDateNaissance: { x: 250, y: 244, maxWidth: 104 },
};

const DISCIPLINE_POSITIONS: Record<
  Discipline,
  { x: number; y: number; xScale: number }
> = {
  judo: { x: 101, y: 584, xScale: 25 },
  kendo: { x: 165, y: 584, xScale: 31 },
  iaido: { x: 260, y: 584, xScale: 27 },
  aikido: { x: 361, y: 584, xScale: 31 },
  jodo: { x: 421, y: 584, xScale: 26 },
};

const WHATSAPP_POSITIONS = {
  oui: { x: 241, xScale: 16 },
  non: { x: 350, xScale: 18 },
} as const;

const IMAGE_RIGHT_POSITIONS = {
  oui: { x: 241, xScale: 16 },
  non: { x: 350, xScale: 18 },
} as const;

const PARENTAL_FIELDS = new Set<keyof InscriptionData>([
  "responsableNom",
  "enfantNom",
  "enfantDateNaissance",
]);

export function getInscriptionSeason(date = new Date()): string {
  const year = date.getFullYear();
  const startYear = date.getMonth() >= 6 ? year : year - 1;
  return `${startYear} – ${startYear + 1}`;
}

function formatDate(value: string): string {
  if (!value) return "";
  const [year, month, day] = value.split("-");
  return day && month && year ? `${day}/${month}/${year}` : value;
}

function fitTextSize(
  font: PDFFont,
  text: string,
  maxWidth: number,
  preferred = 10,
): number {
  let size = preferred;
  while (size > 6 && font.widthOfTextAtSize(text, size) > maxWidth) size -= 0.5;
  return size;
}

function drawValue(
  page: PDFPage,
  font: PDFFont,
  value: string,
  position: TextPosition,
): void {
  const text = value.trim();
  if (!text) return;
  const size = fitTextSize(font, text, position.maxWidth, position.size);
  page.drawText(text, {
    x: position.x,
    y: position.y,
    size,
    font,
    color: rgb(0.05, 0.05, 0.05),
    maxWidth: position.maxWidth,
  });
}

function circleChoice(
  page: PDFPage,
  x: number,
  y: number,
  xScale: number,
): void {
  page.drawEllipse({
    x,
    y,
    xScale,
    yScale: 9,
    borderColor: rgb(0.05, 0.05, 0.05),
    borderWidth: 1.25,
  });
}

function drawInscriptionTitle(
  page: PDFPage,
  font: PDFFont,
  date = new Date(),
): void {
  const title = `DEMANDE D’INSCRIPTION ${getInscriptionSeason(date)}`;
  const size = 23;
  const width = font.widthOfTextAtSize(title, size);

  page.drawRectangle({
    x: 45,
    y: 656,
    width: 505,
    height: 38,
    color: rgb(1, 1, 1),
  });
  page.drawText(title, {
    x: (A4_TEMPLATE.width - width) / 2,
    y: 669,
    size,
    font,
    color: rgb(0, 0, 0),
  });
}

function assertTemplateContract(pdf: PDFDocument): PDFPage {
  if (pdf.getPageCount() !== 1) {
    throw new Error(
      "Le modèle d’inscription a changé (nombre de pages inattendu).",
    );
  }

  const page = pdf.getPage(0);
  const { width, height } = page.getSize();
  if (
    Math.abs(width - A4_TEMPLATE.width) > 0.5 ||
    Math.abs(height - A4_TEMPLATE.height) > 0.5
  ) {
    throw new Error(
      "Le modèle d’inscription a changé (format de page inattendu).",
    );
  }

  if (pdf.getForm().getFields().length !== 0) {
    throw new Error(
      "Le modèle d’inscription a changé (champs PDF inattendus).",
    );
  }

  return page;
}

function sanitizeFilenamePart(value: string): string {
  return (
    value
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-zA-Z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .toLowerCase() || "inscription"
  );
}

export async function generateInscriptionPdf(
  data: InscriptionData,
  templateUrl: string | undefined,
): Promise<void> {
  if (!templateUrl) {
    throw new Error("Aucun modèle PDF disponible. Contactez le club.");
  }
  const response = await fetch(templateUrl, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(
      `Le modèle PDF est indisponible (erreur ${response.status}).`,
    );
  }

  const pdf = await PDFDocument.load(await response.arrayBuffer());
  const page = assertTemplateContract(pdf);
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdf.embedFont(StandardFonts.HelveticaBold);

  drawInscriptionTitle(page, boldFont);

  for (const discipline of data.disciplines) {
    const position = DISCIPLINE_POSITIONS[discipline];
    if (!position) throw new Error(`Discipline inconnue : ${discipline}.`);
    circleChoice(page, position.x, position.y, position.xScale);
  }

  const dateFields = new Set(["dateNaissance", "enfantDateNaissance"]);
  for (const [field, position] of Object.entries(TEXT_POSITIONS)) {
    if (
      !data.autorisationParentale &&
      PARENTAL_FIELDS.has(field as keyof InscriptionData)
    )
      continue;
    const value = data[field as keyof InscriptionData];
    if (typeof value !== "string")
      throw new Error(`Champ PDF invalide : ${field}.`);
    drawValue(
      page,
      font,
      dateFields.has(field) ? formatDate(value) : value,
      position,
    );
  }

  const whatsappPosition = WHATSAPP_POSITIONS[data.whatsapp ? "oui" : "non"];
  circleChoice(page, whatsappPosition.x, 364, whatsappPosition.xScale);

  const imageRightPosition =
    IMAGE_RIGHT_POSITIONS[data.droitImage ? "oui" : "non"];
  circleChoice(page, imageRightPosition.x, 323, imageRightPosition.xScale);

  const bytes = await pdf.save();
  const blob = new Blob([Uint8Array.from(bytes).buffer], {
    type: "application/pdf",
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `demande-inscription-${sanitizeFilenamePart(data.prenom)}-${sanitizeFilenamePart(data.nom)}.pdf`;
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}
