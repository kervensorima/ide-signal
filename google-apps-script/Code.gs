/**
 * IDE SIGNAL — Google Apps Script Web App
 *
 * 1. Create Google Sheet "IDE SIGNAL Leads"
 * 2. Extensions → Apps Script → paste this file
 * 3. Deploy → New deployment → Web app
 *    Execute as: Me | Who has access: Anyone
 * 4. Put the Web App URL in VITE_APPS_SCRIPT_URL
 */

var SHEET_NAME = 'Leads'
var API_SECRET = '' // optional: match VITE_APPS_SCRIPT_SECRET

function doGet() {
  return json_({ ok: true, service: 'IDE SIGNAL', version: 1 })
}

function doPost(e) {
  try {
    var raw = (e && e.postData && e.postData.contents) || '{}'
    var data = JSON.parse(raw)

    if (API_SECRET && data.secret !== API_SECRET) {
      return json_({ ok: false, error: 'Unauthorized' })
    }

    var contact = String(data.contact || '').trim().slice(0, 120)
    var description = String(data.description || '').trim().slice(0, 255)
    var category = String(data.category || '').trim().slice(0, 80)
    var score = Number(data.score)
    var estimatedValue = String(data.estimatedValue || '').trim().slice(0, 80)
    var analysis = String(data.analysis || '').trim().slice(0, 500)
    var userAgent = String(data.userAgent || '').trim().slice(0, 200)
    var locale = String(data.locale || '').trim().slice(0, 20)
    var rejected = Boolean(data.rejected)

    if (description.length < 20 || description.length > 255) {
      return json_({ ok: false, error: 'Invalid description length' })
    }

    if (rejected) {
      score = 0
    } else if (!isFinite(score) || score < 1 || score > 100) {
      return json_({ ok: false, error: 'Invalid score' })
    }

    var sheet = getOrCreateSheet_()
    sheet.appendRow([
      new Date(),
      contact,
      description,
      category,
      score,
      estimatedValue,
      analysis,
      rejected ? 'rejected' : 'ok',
      locale,
      userAgent,
    ])

    return json_({ ok: true, saved: true })
  } catch (err) {
    return json_({ ok: false, error: String(err && err.message ? err.message : err) })
  }
}

function getOrCreateSheet_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet()
  var sheet = ss.getSheetByName(SHEET_NAME)
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME)
    sheet.appendRow([
      'Timestamp',
      'Contact',
      'Description',
      'Category',
      'Score',
      'Estimated Value',
      'Analysis',
      'Status',
      'Locale',
      'User Agent',
    ])
    sheet.setFrozenRows(1)
  }
  return sheet
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(
    ContentService.MimeType.JSON
  )
}
