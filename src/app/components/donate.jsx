'use client'

export default function AddPhraseForm () {
  return <div className='add-phrase-form'>
    <div>
        <h3>Hello.</h3>
        <h4>My name is Idan Stark. I'm a Sanderson fan, and I'm the one who built Khriss AI.</h4>
        <div>
          This kind of website takes a lot of resources. Specifically its hosting and the usage of the AI model.
          If you want to help me keep this website up and running, you can:
        </div>
    </div>
    <div className='donate-buttons' style={{ display: 'flex', gap: '1rem', justifyContent: 'space-evenly' }}>
      <button onClick={() => window.open('https://www.buymeacoffee.com/idanstark', '_blank')}>Buy me a coffee</button>
    </div>
    <div>
      <h4>Or you can donate directly to Khriss AI, and you will get to add a secret codephrase.</h4>
    </div>
  </div>
}