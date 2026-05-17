import * as XLSX from 'xlsx'
import { SupervisionRecord } from '../data'

// 违纪类型中文映射
const violationTypeMap: { [key: string]: string } = {
  'sleep': '睡觉',
  'food': '带餐',
  'dye': '染发',
  'no-book': '未带书',
  'phone': '玩手机',
  'hygiene': '卫生差',
  'absent': '旷课'
}

// 导出督查记录为 Excel
export const exportSupervisionRecordsToExcel = (
  records: SupervisionRecord[],
  filename: string = '督查记录表.xlsx',
  extraInfo?: { date?: string; timeSlot?: string; inspector?: string }
) => {
  // 准备数据
  const data = []
  
  // 第1行：标题
  data.push(['计科院学风建设督查表', '', '', '', '', '', '', '', ''])
  
  // 第2行：信息行
  if (extraInfo) {
    // 解析日期获取星期
    let year = '2026'
    let month = ''
    let day = ''
    let weekday = ''
    let period = extraInfo.timeSlot || ''
    
    if (extraInfo.date) {
      const dateParts = extraInfo.date.split('-')
      year = dateParts[0] || '2026'
      month = dateParts[1] || ''
      day = dateParts[2] || ''
      
      const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
      const weekdayNames = ['日', '一', '二', '三', '四', '五', '六']
      weekday = weekdayNames[date.getDay()]
    }
    
    // 格式化节次
    let jieci = period === '上午' ? '1、2' : '5、6'
    
    // 信息行用空格分隔，保持原格式
    data.push([`${year}年 ${month}月 ${day}日 星期${weekday} 第${jieci}节 检查人：${extraInfo.inspector || ''}`, '', '', '', '', '', '', '', ''])
  } else {
    const now = new Date()
    const year = now.getFullYear()
    const month = (now.getMonth() + 1).toString().padStart(2, '0')
    const day = now.getDate().toString().padStart(2, '0')
    const weekdayNames = ['日', '一', '二', '三', '四', '五', '六']
    const weekday = weekdayNames[now.getDay()]
    const jieci = now.getHours() < 12 ? '1、2' : '5、6'
    data.push([`${year}年 ${month}月 ${day}日 星期${weekday} 第${jieci}节 检查人：`, '', '', '', '', '', '', '', ''])
  }
  
  // 第3行：第一部分表头
  data.push([
    '班级',
    '辅导员',
    '',
    '',
    '考勤情况',
    '',
    '',
    '违纪情况',
    '总分'
  ])
  
  // 第4行：第二部分表头
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
  
  // 添加数据行
  records.forEach(record => {
    // 筛选违纪情况，排除迟到
    const filteredViolations = record.violations.filter(v => v.type !== 'late')
    
    // 统计违纪情况
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
  
  // 创建工作簿
  const ws = XLSX.utils.aoa_to_sheet(data)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, '督查记录')
  
  // 设置列宽
  const wscols = [
    { wch: 15 },  // 班级
    { wch: 10 },  // 辅导员
    { wch: 8 },   // 应到
    { wch: 8 },   // 实到
    { wch: 8 },   // 请假
    { wch: 8 },   // 旷课
    { wch: 8 },   // 迟到
    { wch: 25 },  // 违纪情况
    { wch: 10 }   // 总分
  ]
  ws['!cols'] = wscols
  
  // 合并单元格
  const merges = [
    // 标题行合并
    { s: { r: 0, c: 0 }, e: { r: 0, c: 8 } },
    // 信息行合并
    { s: { r: 1, c: 0 }, e: { r: 1, c: 8 } },
    // 班级（行3-4合并）
    { s: { r: 2, c: 0 }, e: { r: 3, c: 0 } },
    // 辅导员（行3-4合并）
    { s: { r: 2, c: 1 }, e: { r: 3, c: 1 } },
    // 考勤情况（列4-6合并）
    { s: { r: 2, c: 2 }, e: { r: 2, c: 6 } },
    // 违纪情况（行3-4合并）
    { s: { r: 2, c: 7 }, e: { r: 3, c: 7 } },
    // 总分（行3-4合并）
    { s: { r: 2, c: 8 }, e: { r: 3, c: 8 } }
  ]
  
  ws['!merges'] = merges

  // 设置标题样式
  const titleCell = ws[XLSX.utils.encode_cell({ r: 0, c: 0 })]
  if (titleCell) {
    titleCell.s = {
      font: { bold: true, sz: 14 }
    }
  }
  
  // 设置表头样式
  for (let c = 0; c <= 8; c++) {
    for (let r = 2; r <= 3; r++) {
      const cell = ws[XLSX.utils.encode_cell({ r, c })]
      if (cell) {
        cell.s = {
          font: { bold: true },
          fill: { fgColor: { rgb: 'FFFFFF' } }
        }
      }
    }
  }
  
  // 导出文件
  XLSX.writeFile(wb, filename)
}
