/**
 * IDE SIGNAL — Google Apps Script Web App
 *
 * Redeploy after changes: Deploy → Manage deployments → Edit → New version
 */

var SHEET_NAME = 'Leads'
var API_SECRET = ''

var HEADERS = [
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
  'IP',
  'Location',
  'City',
  'Region',
  'Country',
  'Postal',
  'Latitude',
  'Longitude',
  'Geo Source',
  'ISP',
  'Device Summary',
  'Device JSON',
]

function doGet() {
  return json_({ ok: true, service: 'IDE SIGNAL', version: 2 })
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
    var userAgent = String(data.userAgent || '').trim().slice(0, 300)
    var locale = String(data.locale || '').trim().slice(0, 20)
    var rejected = Boolean(data.rejected)

    var ip = String(data.ip || '').trim().slice(0, 64)
    var location = String(data.location || '').trim().slice(0, 160)
    var city = String(data.city || '').trim().slice(0, 80)
    var region = String(data.region || '').trim().slice(0, 80)
    var country = String(data.country || '').trim().slice(0, 80)
    var postal = String(data.postal || '').trim().slice(0, 30)
    var latitude = String(data.latitude || '').trim().slice(0, 32)
    var longitude = String(data.longitude || '').trim().slice(0, 32)
    var geoSource = String(data.geoSource || '').trim().slice(0, 40)
    var isp = String(data.isp || '').trim().slice(0, 120)
    var deviceSummary = String(data.deviceSummary || '').trim().slice(0, 200)
    var deviceJson = String(data.deviceJson || '').trim().slice(0, 800)

    if (!contact) {
      return json_({ ok: false, error: 'Contact required' })
    }

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
      ip,
      location,
      city,
      region,
      country,
      postal,
      latitude,
      longitude,
      geoSource,
      isp,
      deviceSummary,
      deviceJson,
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
    sheet.appendRow(HEADERS)
    sheet.setFrozenRows(1)
    return sheet
  }

  var lastCol = Math.max(sheet.getLastColumn(), HEADERS.length)
  var current = sheet.getRange(1, 1, 1, lastCol).getValues()[0]
  var needsUpdate = false
  for (var i = 0; i < HEADERS.length; i++) {
    if (String(current[i] || '') !== HEADERS[i]) {
      needsUpdate = true
      break
    }
  }
  if (needsUpdate) {
    sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS])
    sheet.setFrozenRows(1)
  }
  return sheet
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(
    ContentService.MimeType.JSON
  )
}
