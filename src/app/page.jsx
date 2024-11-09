import Conversation from '@/app/components/conversation'
import AddPhraseForm from '@/app/components/add-phrase-form'
import Modal from '@/app/components/modal'

import { FaCode } from 'react-icons/fa'

export default function Home() {
  return <div id='messenger'>
    <Modal button={<><FaCode /> Add Phrase</>}>
      <AddPhraseForm />
    </Modal>
    <Conversation />
  </div>
}
