"use strict";

import ExcelJS from "exceljs";

import { JobCardResult } from "../interfaces/job-cards";
import { db } from "../db";
import { ExcelRow } from "../interfaces/excel";

export async function exportData(filename: string): Promise<void> {
  const workbook = new ExcelJS.Workbook();

  const sheets = new Map<string, ExcelJS.Worksheet>();
  for await (const item of db.iterate()) {
    const jobCard: JobCardResult = item.value;
    let sheet;
    if (!sheets.has(jobCard.source)) {
      sheet = await workbook.addWorksheet(jobCard.source);
      sheet.columns = [
        { header: "Job Id", key: "jobId", width: 10 },
        { header: "Created At", key: "createdAt", width: 10 },
        { header: "Company Name", key: "companyName", width: 32 },
        { header: "Title", key: "title", width: 32 },
        { header: "Location", key: "location", width: 20 },
        { header: "Job Description", key: "jobDescription", width: 50 },
        { header: "URL", key: "url", width: 10 },
      ];
      sheets.set(jobCard.source, sheet);
    } else {
      sheet = sheets.get(jobCard.source);
    }

    await sheet.addRow(mapToExcel(jobCard));
  }
  await workbook.xlsx.writeFile(filename);
}

function mapToExcel(jobCard: JobCardResult): ExcelRow {
  const excelRow: ExcelRow = {
    createdAt: new Date(jobCard.createdAt),
    source: jobCard.source,
    jobId: `${jobCard.source}-${jobCard.jobId}`,
    title: jobCard.title,
    companyName: jobCard.companyName,
    location: jobCard.location,
    jobDescription: jobCard.jobDescription,
    url: {
      text: jobCard.url,
      hyperlink: jobCard.url,
      tooltip: "Visit page",
    },
  };

  return excelRow;
}
