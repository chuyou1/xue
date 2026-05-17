import { createContext, useContext, useState, ReactNode } from 'react'
import Modal from '../components/Modal'

interface ModalState {
  isOpen: boolean
  title: string
  message: string
  type: 'success' | 'warning' | 'error' | 'info'
  onConfirm?: () => void
  showCancel: boolean
}

interface ModalContextType {
  showModal: (options: Omit<ModalState, 'isOpen' | 'showCancel'> & { showCancel?: boolean }) => void
  hideModal: () => void
}

const ModalContext = createContext<ModalContextType | undefined>(undefined)

export function ModalProvider({ children }: { children: ReactNode }) {
  const [modalState, setModalState] = useState<ModalState>({
    isOpen: false,
    title: '',
    message: '',
    type: 'info',
    showCancel: false
  })

  const showModal = (options: Omit<ModalState, 'isOpen' | 'showCancel'> & { showCancel?: boolean }) => {
    setModalState({
      isOpen: true,
      showCancel: false,
      ...options
    })
  }

  const hideModal = () => {
    setModalState(prev => ({ ...prev, isOpen: false }))
  }

  return (
    <ModalContext.Provider value={{ showModal, hideModal }}>
      {children}
      <Modal
        isOpen={modalState.isOpen}
        title={modalState.title}
        message={modalState.message}
        type={modalState.type}
        onClose={hideModal}
        onConfirm={modalState.onConfirm}
        showCancel={modalState.showCancel}
      />
    </ModalContext.Provider>
  )
}

export function useModal() {
  const context = useContext(ModalContext)
  if (!context) {
    throw new Error('useModal must be used within a ModalProvider')
  }
  return context
}
