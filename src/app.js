import Vue from 'vue'
import Frog from './component/frog'
import Editor from './component/editor'
import MessageBox from './component/message-box'
import {ApiAiClient} from "api-ai-javascript"

new Vue({
  el: '#app',
  components: {
    'frog': Frog,
    'editor': Editor,
    'message-box': MessageBox,
  },
  data: {
    messages: [
      {
        type: 'frog',
        content: '你好呀，我是小蛙',
      },
    ],
    client: new ApiAiClient({
      accessToken: 'b6111438a5f54e6eaa70e72aaab8d380',
      lang: 'zh-CN',
    }),
    recognition: null,
    talkative: true,
  },
  methods: {
    submit(content) {
      if (!content) return
      this.messages.push({
        type: 'user',
        content,
      })
      this.client.textRequest(content)
        .then(({result}) => {
          const fulfillment = result.fulfillment;
          let speeh = fulfillment.speech;
          const messages = fulfillment.messages;
          for (let message of messages) {
            if (message['type'] === 4) {
              if (message['payload']['payload']) {
                speeh = message['payload'][speeh]
              }
            }
          }
          this.reply(speeh)
        })
    },
    reply(content) {
      this.messages.push({
        type: 'frog',
        content: content,
      })
      this.speak(content)
    },
    speak(content) {
      if (!window.SpeechSynthesisUtterance) return
      const utterance = new SpeechSynthesisUtterance();
      utterance.text = content;
      window.speechSynthesis.speak(utterance);
    },
    listen(callback) {
      if (this.recognition) {
        this.recognition.stop()
        this.recognition = null
        return
      }
      if (!window.webkitSpeechRecognition) {
        this.reply('好可惜，你的设备不支持语音识别哦')
        this.talkative = false
        return
      }
      const recognition = new webkitSpeechRecognition()
      recognition.lang = 'zh-CN'
      recognition.onstart = () => {
        this.recognition = recognition
      }
      recognition.onresult = event => {
        this.recognition = null
        const count = event.results.length - 1
        const length = event.results[count].length - 1
        const content = event.results[count][length].transcript
      	this.submit(content)
      }
      recognition.start()
    },
    touch(position) {
      console.log(position)
      switch (position) {
          case 'left':
            this.reply('别动她')
            break
          case 'right':
            this.reply('怎么可以碰可爱的龟龟')
            break
          case 'middle':
            this.reply('再碰我，以后你的每一分钟都会只有59秒')
            break
          case 'head':
            this.reply('别摸我的头，信不信让你减一秒')
            break
          default:
      }
    },
  }
})
