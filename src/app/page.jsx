import Conversation from '@/app/components/conversation'
import AddPhraseForm from '@/app/components/add-phrase-form'
import Donate from '@/app/components/donate'
import Modal from '@/app/components/modal'

import { FaCode, FaHandHoldingUsd } from 'react-icons/fa'

export default function Home() {
  return <div id='messenger'>
    <Modal button={<><FaHandHoldingUsd /> Donate</>} name='donate'>
      <Donate />
    </Modal>
    <Modal button={<>Add Code Phrases <FaCode /></>} name='add-phrase'>
      <AddPhraseForm />
    </Modal>
    <Conversation />
  </div>
}
