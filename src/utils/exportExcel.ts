import * as XLSX from 'xlsx'
import { SupervisionRecord } from '../data'

const violationTypeMap: { [key: string]: string } = {
  'sleep': '睡觉',
  'food': '带餐',
  'dye': '染发',
  'no-book': '未带书',
  'phone': '玩手机',
  'hygiene': '卫生差',
  'absent': '旷课'
}

const createCellStyle = (options: {
  bold?: boolean
  fontSize?: number
  align?: 'left' | 'center' | 'right'
  verticalAlign?: 'top' | 'middle' | 'bottom'
  fillColor?: string
  border?: boolean
}) => {
  return {
    font: {
      bold: options.bold || false,
      sz: options.fontSize || 11
    },
    alignment: {
      horizontal: options.align || 'center',
      vertical: options.verticalAlign || 'middle',
      wrapText: true
    },
    fill: options.fillColor ? { fgColor: { rgb: options.fillColor } } : undefined,
    border: options.border ? {
      top: { style: 'thin' },
      bottom: { style: 'thin' },
      left: { style: 'thin' },
      right: { style: 'thin' }
    } : undefined
  }
}

export const exportSupervisionRecordsToExcel = (
  records: SupervisionRecord[],
  filename: string = '督查记录表.xlsx',
  extraInfo?: { date?: string; timeSlot?: string; inspector?: string }
) => {
  const data: (string | number)[][] = []
  
  let year = '2026'
  let month = ''
  let day = ''
  let weekday = ''
  let jieci = ''

  if (extraInfo) {
    jieci = extraInfo.timeSlot === '上午' ? '1、2' : '5、6'
    
    if (extraInfo.date) {
      const dateParts = extraInfo.date.split('-')
      year = dateParts[0] || '2026'
      month = dateParts[1] || ''
      day = dateParts[2] || ''
      
      const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
      const weekdayNames = ['日', '一', '二', '三', '四', '五', '六']
      weekday = weekdayNames[date.getDay()]
    }
  } else {
    const now = new Date()
    year = now.getFullYear().toString()
    month = (now.getMonth() + 1).toString().padStart(2, '0')
    day = now.getDate().toString().padStart(2, '0')
    const weekdayNames = ['日', '一', '二', '三', '四', '五', '六']
    weekday = weekdayNames[now.getDay()]
    jieci = now.getHours() < 12 ? '1、2' : '5、6'
  }

  data.push(['计科院学风建设督查表'])
  data.push([`${year}年${month}月${day}日 星期${weekday} 第${jieci}节 检查人：${extraInfo?.inspector || ''}`])
  data.push([])

  data.push([
    '班级',
    '辅导员',
    '考勤情况',
    '',
    '',
    '',
    '',
    '违纪情况',
    '总分'
  ])

  data.push([
    '',
    '',
    '应到',
    '实到',
    '请假',
    '旷课',
    '迟到',
    '',
    ''
  ])

  records.forEach(record => {
    const filteredViolations = record.violations.filter(v => v.type !== 'late')
    const typeCount: { [key: string]: number } = {}
    filteredViolations.forEach(v => {
      const type = violationTypeMap[v.type] || v.type
      typeCount[type] = (typeCount[type] || 0) + 1
    })
    const violationDisplay = Object.entries(typeCount)
      .map(([type, count]) => `${type}：${count}`)
      .join('，') || '无'

    data.push([
      record.className,
      record.instructor,
      record.classAttendance?.shouldAttend || '-',
      record.classAttendance?.present || '-',
      record.classAttendance && record.classAttendance.leave > 0 ? record.classAttendance.leave : '-',
      record.classAttendance && record.classAttendance.absent > 0 ? record.classAttendance.absent : '-',
      record.classAttendance && record.classAttendance.late > 0 ? record.classAttendance.late : '-',
      violationDisplay,
      `${record.score}分`
    ])
  })

  const ws = XLSX.utils.aoa_to_sheet(data)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, '督查记录')

  const wscols = [
    { wch: 18 },
    { wch: 12 },
    { wch: 8 },
    { wch: 8 },
    { wch: 8 },
    { wch: 8 },
    { wch: 8 },
    { wch: 28 },
    { wch: 10 }
  ]
  ws['!cols'] = wscols

  const merges = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 8 } },
    { s: { r: 1, c: 0 }, e: { r: 1, c: 8 } },
    { s: { r: 3, c: 0 }, e: { r: 4, c: 0 } },
    { s: { r: 3, c: 1 }, e: { r: 4, c: 1 } },
    { s: { r: 3, c: 2 }, e: { r: 3, c: 6 } },
    { s: { r: 3, c: 7 }, e: { r: 4, c: 7 } },
    { s: { r: 3, c: 8 }, e: { r: 4, c: 8 } }
  ]
  ws['!merges'] = merges

  const titleStyle = createCellStyle({ bold: true, fontSize: 16, align: 'center', verticalAlign: 'middle' })
  const infoStyle = createCellStyle({ fontSize: 12, align: 'left', verticalAlign: 'middle' })
  const headerStyle = createCellStyle({ bold: true, fontSize: 12, align: 'center', verticalAlign: 'middle', fillColor: 'FFFFFF', border: true })
  const dataStyle = createCellStyle({ fontSize: 11, align: 'center', verticalAlign: 'middle', border: true })
  const textDataStyle = createCellStyle({ fontSize: 11, align: 'left', verticalAlign: 'middle', border: true })

  const titleCell = ws[XLSX.utils.encode_cell({ r: 0, c: 0 })]
  if (titleCell) titleCell.s = titleStyle

  const infoCell = ws[XLSX.utils.encode_cell({ r: 1, c: 0 })]
  if (infoCell) infoCell.s = infoStyle

  for (let c = 0; c <= 8; c++) {
    const cell3 = ws[XLSX.utils.encode_cell({ r: 3, c })]
    const cell4 = ws[XLSX.utils.encode_cell({ r: 4, c })]
    if (cell3) cell3.s = headerStyle
    if (cell4) cell4.s = headerStyle
  }

  for (let r = 5; r < data.length; r++) {
    for (let c = 0; c <= 8; c++) {
      const cell = ws[XLSX.utils.encode_cell({ r, c })]
      if (cell) {
        cell.s = c === 0 || c === 1 || c === 7 ? textDataStyle : dataStyle
      }
    }
  }

  XLSX.writeFile(wb, filename)
}