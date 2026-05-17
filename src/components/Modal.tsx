import { useEffect } from 'react'
import '../styles/Modal.css'

interface ModalProps {
  isOpen: boolean
  title: string
  message: string
  type?: 'success' | 'warning' | 'error' | 'info'
  onClose: () => void
  onConfirm?: () => void
  showCancel?: boolean
}

function Modal({ isOpen, title, message, type = 'info', onClose, onConfirm, showCancel = false }: ModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'auto'
    }
    return () => {
      document.body.style.overflow = 'auto'
    }
  }, [isOpen])

  if (!isOpen) return null

  const getIcon = () => {
    switch (type) {
      case 'success':
        return '✓'
      case 'warning':
        return '⚠'
      case 'error':
        return '✕'
      case 'info':
      default:
        return 'ℹ'
    }
  }

  const getTypeClass = () => {
    switch (type) {
      case 'success':
        return 'modal-success'
      case 'warning':
        return 'modal-warning'
      case 'error':
        return 'modal-error'
      case 'info':
      default:
        return 'modal-info'
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <div className={`modal-header ${getTypeClass()}`}>
          <span className="modal-icon">{getIcon()}</span>
          <span className="modal-title">{title}</span>
          <button className="modal-close-btn" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          <p className="modal-message">{message}</p>
        </div>
        <div className="modal-footer">
          {showCancel && (
            <button className="modal-btn modal-btn-secondary" onClick={onClose}>
              取消
            </button>
          )}
          <button className="modal-btn modal-btn-primary" onClick={onConfirm || onClose}>
            {onConfirm ? '确认' : '确定'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default Modal
