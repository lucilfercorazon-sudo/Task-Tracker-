import { MonthData } from '../types';

declare global {
  interface Window {
    google?: any;
  }
}

declare const google: any;

// Helper to convert column index to A1 notation column letter (1 -> A, 2 -> B, ..., 26 -> Z, 27 -> AA)
function getColumnLetter(colIndex: number): string {
  let temp = colIndex;
  let letter = '';
  while (temp > 0) {
    const mod = (temp - 1) % 26;
    letter = String.fromCharCode(65 + mod) + letter;
    temp = Math.floor((temp - mod) / 26);
  }
  return letter;
}

export class GoogleSheetsService {
  private static tokenClient: any = null;
  private static accessToken: string | null = null;
  private static clientId: string = '';

  /**
   * Initialize Google Identity Services token client
   */
  public static async initClient(clientId: string): Promise<void> {
    this.clientId = clientId;
    if (typeof window === 'undefined') return;

    if (!document.getElementById('gsi-script')) {
      await new Promise<void>((resolve, reject) => {
        const script = document.createElement('script');
        script.id = 'gsi-script';
        script.src = 'https://accounts.google.com/gsi/client';
        script.async = true;
        script.defer = true;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error('فشل تحميل Google Identity Services SDK'));
        document.head.appendChild(script);
      });
    }

    if (window.google?.accounts?.oauth2) {
      this.tokenClient = window.google.accounts.oauth2.initTokenClient({
        client_id: clientId,
        scope: 'https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/drive.file',
        callback: () => {}, // dynamically handled per request
      });
    }
  }

  /**
   * Request access token from user via popup
   */
  public static async requestAccessToken(): Promise<string> {
    if (this.accessToken) {
      return this.accessToken;
    }

    return new Promise((resolve, reject) => {
      try {
        if (!this.tokenClient) {
          if (window.google?.accounts?.oauth2 && this.clientId) {
            this.tokenClient = window.google.accounts.oauth2.initTokenClient({
              client_id: this.clientId,
              scope: 'https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/drive.file',
              callback: (resp: any) => {
                if (resp.error) {
                  reject(new Error(resp.error_description || resp.error));
                  return;
                }
                this.accessToken = resp.access_token;
                resolve(resp.access_token);
              },
            });
          } else {
            reject(new Error('Google Client لم يتم تهيئته بعد'));
            return;
          }
        }

        this.tokenClient.callback = (resp: any) => {
          if (resp.error) {
            reject(new Error(resp.error_description || resp.error));
            return;
          }
          this.accessToken = resp.access_token;
          resolve(resp.access_token);
        };

        this.tokenClient.requestAccessToken({ prompt: 'consent' });
      } catch (err) {
        reject(err);
      }
    });
  }

  public static isConnected(): boolean {
    return !!this.accessToken;
  }

  public static getSavedToken(): string | null {
    return this.accessToken;
  }

  public static setTokenManually(token: string) {
    this.accessToken = token;
  }

  /**
   * Creates a complete, masterfully formatted Habit Tracker Google Sheet with exact formulas, dark theme styling, and checkboxes
   */
  public static async createHabitTrackerSheet(
    monthData: MonthData,
    token?: string
  ): Promise<{ spreadsheetId: string; spreadsheetUrl: string }> {
    const accessToken = token || (await this.requestAccessToken());
    const sheetTitle = `جدول تتبع العادات اليومية - ${monthData.monthNameArabic} ${monthData.year} [لوحة تحكم احترافية]`;

    // 1. Create Spreadsheet
    const createResponse = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        properties: {
          title: sheetTitle,
          locale: 'ar_SA',
          autoRecalc: 'ON_CHANGE',
          timeZone: 'Asia/Riyadh',
        },
        sheets: [
          {
            properties: {
              sheetId: 0,
              title: `تتبع العادات - ${monthData.monthNameArabic}`,
              rightToLeft: true,
              gridProperties: {
                rowCount: Math.max(50, monthData.habits.length + 25),
                columnCount: monthData.daysCount + 10,
                frozenRowCount: 7,
                frozenColumnCount: 2,
              },
            },
          },
        ],
      }),
    });

    if (!createResponse.ok) {
      const err = await createResponse.json().catch(() => ({}));
      throw new Error(`تعذر إنشاء جدول Google Sheets: ${err.error?.message || createResponse.statusText}`);
    }

    const createdData = await createResponse.json();
    const spreadsheetId = createdData.spreadsheetId;
    const spreadsheetUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`;

    // 2. Build rows and formulas
    const days = monthData.daysCount;
    const habits = monthData.habits;

    // Layout Architecture:
    // Row 1: Main Header Banner (Title + Month)
    // Row 2: KPI Metrics Cards (Total Completed, Total Uncompleted, Overall %, Best Streak)
    // Row 3: KPI Metrics Values
    // Row 4: Empty space / Divider
    // Row 5: Table Header (Habit Name | Category | Day 1 | Day 2 | ... | Day N | Completed Days | Commitment % | Progress Bar)
    // Row 6: Day Number (1 .. N)
    // Row 7.. (6 + habits.length): Habit Rows with Checkboxes & Formulas
    // Row (7 + habits.length): Daily Completed Count Summary
    // Row (8 + habits.length): Daily Commitment % Summary

    const startHabitRow = 7;
    const endHabitRow = startHabitRow + habits.length - 1;
    const firstDayCol = 3; // Column C is Day 1
    const lastDayCol = 2 + days; // Column (2 + days)
    const completedDaysCol = lastDayCol + 1;
    const percentageCol = completedDaysCol + 1;

    const firstDayLetter = getColumnLetter(firstDayCol);
    const lastDayLetter = getColumnLetter(lastDayCol);
    const completedDaysLetter = getColumnLetter(completedDaysCol);
    const percentageLetter = getColumnLetter(percentageCol);

    // Prepare Value Data matrix
    const valuesMatrix: any[][] = [];

    // Row 1 (Title)
    valuesMatrix[0] = [`🎯 لوحة تتبع وتطوير العادات اليومية - شهر ${monthData.monthNameArabic} ${monthData.year}`];

    // Row 2 & 3: KPI Headers and Formulas
    valuesMatrix[1] = ['📊 إجمالي العادات المنجزة', '⏳ إجمالي غير المكتملة', '📈 معدل الالتزام العام %', '🔥 أفضل سلسلة أيام متتالية', '⭐ عدد العادات النشطة'];
    valuesMatrix[2] = [
      `=SUM(${completedDaysLetter}${startHabitRow}:${completedDaysLetter}${endHabitRow})`,
      `=(${habits.length * days}) - A3`,
      `=AVERAGE(${percentageLetter}${startHabitRow}:${percentageLetter}${endHabitRow})`,
      `=COUNTIF(C${endHabitRow + 2}:${lastDayLetter}${endHabitRow + 2}, ">=70%") & " أيام"`,
      `${habits.length}`,
    ];

    // Row 4: Empty
    valuesMatrix[3] = [''];

    // Row 5: Table Header Row
    const headerRow5: string[] = ['اسم العادة اليومية', 'التصنيف'];
    for (let d = 1; d <= days; d++) {
      headerRow5.push(`يوم ${d}`);
    }
    headerRow5.push('الأيام المنجزة', 'نسبة الالتزام %', 'التقييم');
    valuesMatrix[4] = headerRow5;

    // Row 6: Day names/numbers
    const dayNumbersRow6: string[] = ['قائمة العادات', 'النوع'];
    for (let d = 1; d <= days; d++) {
      dayNumbersRow6.push(`${d}`);
    }
    dayNumbersRow6.push('المجموع', 'المعدل', 'الحالة');
    valuesMatrix[5] = dayNumbersRow6;

    // Habit Rows (Index 6 to 6 + habits.length - 1)
    habits.forEach((habit, hIdx) => {
      const rowNum = startHabitRow + hIdx; // 1-indexed in sheet
      const habitRow: any[] = [habit.name, habit.category];

      for (let d = 1; d <= days; d++) {
        const isChecked = monthData.records[d]?.[habit.id] ?? false;
        habitRow.push(isChecked);
      }

      // Formulas for habit row
      // Completed Days: =COUNTIF(C7:AG7, TRUE)
      habitRow.push(`=COUNTIF(${firstDayLetter}${rowNum}:${lastDayLetter}${rowNum}, TRUE)`);
      // Percentage: =COUNTIF(C7:AG7, TRUE) / days
      habitRow.push(`=IFERROR(${completedDaysLetter}${rowNum} / ${days}, 0)`);
      // Rating: IF >= 80% "ممتاز ⭐⭐⭐", IF >= 50% "جيد ⭐⭐", "يحتاج تحسين ⭐"
      habitRow.push(`=IF(${percentageLetter}${rowNum}>=0.8, "ممتاز ⭐⭐⭐", IF(${percentageLetter}${rowNum}>=0.5, "جيد ⭐⭐", "يحتاج تحسين ⭐"))`);

      valuesMatrix.push(habitRow);
    });

    // Row for Total Daily Completed
    const dailyCompletedRow: any[] = ['إجمالي الإنجاز اليومي', 'COUNT'];
    for (let d = 1; d <= days; d++) {
      const colLet = getColumnLetter(firstDayCol + d - 1);
      dailyCompletedRow.push(`=COUNTIF(${colLet}${startHabitRow}:${colLet}${endHabitRow}, TRUE)`);
    }
    dailyCompletedRow.push(`=SUM(${completedDaysLetter}${startHabitRow}:${completedDaysLetter}${endHabitRow})`);
    dailyCompletedRow.push(`=AVERAGE(${percentageLetter}${startHabitRow}:${percentageLetter}${endHabitRow})`);
    valuesMatrix.push(dailyCompletedRow);

    // Row for Daily Percentage %
    const dailyPercentageRow: any[] = ['نسبة الإنجاز اليومي %', 'RATE'];
    for (let d = 1; d <= days; d++) {
      const colLet = getColumnLetter(firstDayCol + d - 1);
      const sumRowNum = endHabitRow + 1;
      dailyPercentageRow.push(`=IFERROR(${colLet}${sumRowNum} / ${habits.length}, 0)`);
    }
    dailyPercentageRow.push('');
    dailyPercentageRow.push(`=AVERAGE(${firstDayLetter}${endHabitRow + 2}:${lastDayLetter}${endHabitRow + 2})`);
    valuesMatrix.push(dailyPercentageRow);

    // 3. Write data & formulas to sheet
    const writeDataResp = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/A1:${getColumnLetter(percentageCol + 1)}${valuesMatrix.length}?valueInputOption=USER_ENTERED`,
      {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          values: valuesMatrix,
        }),
      }
    );

    if (!writeDataResp.ok) {
      console.warn('Writing values warning, proceeding with styling and formatting');
    }

    // 4. Send batchUpdate for Checkboxes, Beautiful Dark Theme Styling, Column Widths, and Conditional Formatting
    const batchRequests: any[] = [
      // Convert Habit Checkbox Range to Checkbox DataValidation
      {
        setDataValidation: {
          range: {
            sheetId: 0,
            startRowIndex: startHabitRow - 1, // 0-indexed: 6
            endRowIndex: endHabitRow, // 0-indexed: 6 + habits.length
            startColumnIndex: firstDayCol - 1, // 0-indexed: 2 (Col C)
            endColumnIndex: lastDayCol, // Col last day
          },
          rule: {
            condition: {
              type: 'BOOLEAN',
            },
            showCustomUi: true,
            strict: true,
          },
        },
      },
      // Format Percentage Columns (percentageCol and Daily Percentage row)
      {
        setNumberFormat: {
          range: {
            sheetId: 0,
            startRowIndex: startHabitRow - 1,
            endRowIndex: endHabitRow,
            startColumnIndex: percentageCol - 1,
            endColumnIndex: percentageCol,
          },
          format: {
            type: 'PERCENT',
            pattern: '0.0%',
          },
        },
      },
      {
        setNumberFormat: {
          range: {
            sheetId: 0,
            startRowIndex: endHabitRow + 1,
            endRowIndex: endHabitRow + 2,
            startColumnIndex: firstDayCol - 1,
            endColumnIndex: lastDayCol,
          },
          format: {
            type: 'PERCENT',
            pattern: '0%',
          },
        },
      },
      {
        setNumberFormat: {
          range: {
            sheetId: 0,
            startRowIndex: 2,
            endRowIndex: 3,
            startColumnIndex: 2,
            endColumnIndex: 3,
          },
          format: {
            type: 'PERCENT',
            pattern: '0.0%',
          },
        },
      },
      // Format Title Banner Row (A1:Z1)
      {
        repeatCell: {
          range: {
            sheetId: 0,
            startRowIndex: 0,
            endRowIndex: 1,
            startColumnIndex: 0,
            endColumnIndex: lastDayCol + 3,
          },
          cell: {
            userEnteredFormat: {
              backgroundColor: { red: 0.08, green: 0.09, blue: 0.18 }, // Deep Dark Navy
              textFormat: {
                foregroundColor: { red: 0.95, green: 0.95, blue: 1.0 },
                fontSize: 14,
                bold: true,
              },
              horizontalAlignment: 'CENTER',
              verticalAlignment: 'MIDDLE',
            },
          },
          fields: 'userEnteredFormat(backgroundColor,textFormat,horizontalAlignment,verticalAlignment)',
        },
      },
      // Merge A1 banner across columns
      {
        mergeCells: {
          range: {
            sheetId: 0,
            startRowIndex: 0,
            endRowIndex: 1,
            startColumnIndex: 0,
            endColumnIndex: 8,
          },
          mergeType: 'MERGE_ALL',
        },
      },
      // Format KPI Header Row (Row 2)
      {
        repeatCell: {
          range: {
            sheetId: 0,
            startRowIndex: 1,
            endRowIndex: 2,
            startColumnIndex: 0,
            endColumnIndex: 5,
          },
          cell: {
            userEnteredFormat: {
              backgroundColor: { red: 0.15, green: 0.12, blue: 0.28 }, // Dark Purple
              textFormat: {
                foregroundColor: { red: 0.85, green: 0.8, blue: 1.0 },
                fontSize: 10,
                bold: true,
              },
              horizontalAlignment: 'CENTER',
              verticalAlignment: 'MIDDLE',
            },
          },
          fields: 'userEnteredFormat(backgroundColor,textFormat,horizontalAlignment,verticalAlignment)',
        },
      },
      // Format KPI Values Row (Row 3)
      {
        repeatCell: {
          range: {
            sheetId: 0,
            startRowIndex: 2,
            endRowIndex: 3,
            startColumnIndex: 0,
            endColumnIndex: 5,
          },
          cell: {
            userEnteredFormat: {
              backgroundColor: { red: 0.11, green: 0.13, blue: 0.22 }, // Dark Navy Blue
              textFormat: {
                foregroundColor: { red: 0.4, green: 0.85, blue: 0.95 }, // Cyan Bright
                fontSize: 15,
                bold: true,
              },
              horizontalAlignment: 'CENTER',
              verticalAlignment: 'MIDDLE',
            },
          },
          fields: 'userEnteredFormat(backgroundColor,textFormat,horizontalAlignment,verticalAlignment)',
        },
      },
      // Format Table Headers (Rows 5 & 6)
      {
        repeatCell: {
          range: {
            sheetId: 0,
            startRowIndex: 4,
            endRowIndex: 6,
            startColumnIndex: 0,
            endColumnIndex: percentageCol + 1,
          },
          cell: {
            userEnteredFormat: {
              backgroundColor: { red: 0.18, green: 0.14, blue: 0.35 }, // Indigo Accent
              textFormat: {
                foregroundColor: { red: 1.0, green: 1.0, blue: 1.0 },
                fontSize: 10,
                bold: true,
              },
              horizontalAlignment: 'CENTER',
              verticalAlignment: 'MIDDLE',
            },
          },
          fields: 'userEnteredFormat(backgroundColor,textFormat,horizontalAlignment,verticalAlignment)',
        },
      },
      // Format Habit Names & Categories Column
      {
        repeatCell: {
          range: {
            sheetId: 0,
            startRowIndex: startHabitRow - 1,
            endRowIndex: endHabitRow,
            startColumnIndex: 0,
            endColumnIndex: 1,
          },
          cell: {
            userEnteredFormat: {
              backgroundColor: { red: 0.08, green: 0.1, blue: 0.17 },
              textFormat: {
                foregroundColor: { red: 0.95, green: 0.95, blue: 1.0 },
                fontSize: 10,
                bold: true,
              },
              horizontalAlignment: 'RIGHT',
              verticalAlignment: 'MIDDLE',
            },
          },
          fields: 'userEnteredFormat(backgroundColor,textFormat,horizontalAlignment,verticalAlignment)',
        },
      },
      // Format Daily Summary Footers (Row endHabitRow + 1 & endHabitRow + 2)
      {
        repeatCell: {
          range: {
            sheetId: 0,
            startRowIndex: endHabitRow,
            endRowIndex: endHabitRow + 2,
            startColumnIndex: 0,
            endColumnIndex: percentageCol + 1,
          },
          cell: {
            userEnteredFormat: {
              backgroundColor: { red: 0.14, green: 0.16, blue: 0.28 },
              textFormat: {
                foregroundColor: { red: 0.9, green: 0.9, blue: 1.0 },
                fontSize: 10,
                bold: true,
              },
              horizontalAlignment: 'CENTER',
              verticalAlignment: 'MIDDLE',
            },
          },
          fields: 'userEnteredFormat(backgroundColor,textFormat,horizontalAlignment,verticalAlignment)',
        },
      },
      // Adjust Column Widths (Col A Habit Names wider, Checkbox cols compact)
      {
        updateDimensionProperties: {
          range: {
            sheetId: 0,
            dimension: 'COLUMNS',
            startIndex: 0,
            endIndex: 1,
          },
          properties: {
            pixelSize: 260,
          },
          fields: 'pixelSize',
        },
      },
      {
        updateDimensionProperties: {
          range: {
            sheetId: 0,
            dimension: 'COLUMNS',
            startIndex: 1,
            endIndex: 2,
          },
          properties: {
            pixelSize: 110,
          },
          fields: 'pixelSize',
        },
      },
      {
        updateDimensionProperties: {
          range: {
            sheetId: 0,
            dimension: 'COLUMNS',
            startIndex: firstDayCol - 1,
            endIndex: lastDayCol,
          },
          properties: {
            pixelSize: 42,
          },
          fields: 'pixelSize',
        },
      },
      {
        updateDimensionProperties: {
          range: {
            sheetId: 0,
            dimension: 'COLUMNS',
            startIndex: completedDaysCol - 1,
            endIndex: percentageCol + 1,
          },
          properties: {
            pixelSize: 110,
          },
          fields: 'pixelSize',
        },
      },
    ];

    // Execute Batch Styling
    const formatResp = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        requests: batchRequests,
      }),
    });

    if (!formatResp.ok) {
      console.warn('Batch format returned non-ok, sheet was created successfully');
    }

    return {
      spreadsheetId,
      spreadsheetUrl,
    };
  }

  /**
   * Syncs existing month changes to Google Sheet
   */
  public static async syncDataToSheet(
    spreadsheetId: string,
    monthData: MonthData,
    token?: string
  ): Promise<void> {
    const accessToken = token || (await this.requestAccessToken());
    const days = monthData.daysCount;
    const habits = monthData.habits;

    const startHabitRow = 7;
    const firstDayCol = 3;
    const lastDayCol = 2 + days;

    const firstDayLetter = getColumnLetter(firstDayCol);
    const lastDayLetter = getColumnLetter(lastDayCol);

    const valuesMatrix: boolean[][] = [];
    habits.forEach((habit) => {
      const row: boolean[] = [];
      for (let d = 1; d <= days; d++) {
        row.push(monthData.records[d]?.[habit.id] ?? false);
      }
      valuesMatrix.push(row);
    });

    const range = `تتبع العادات - ${monthData.monthNameArabic}!${firstDayLetter}${startHabitRow}:${lastDayLetter}${startHabitRow + habits.length - 1}`;

    const resp = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}?valueInputOption=USER_ENTERED`,
      {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          values: valuesMatrix,
        }),
      }
    );

    if (!resp.ok) {
      const err = await resp.json().catch(() => ({}));
      throw new Error(`فشل تحديث بيانات Google Sheet: ${err.error?.message || resp.statusText}`);
    }
  }
}
