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
    listening: false,
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
          this.reply(result.fulfillment.speech)
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
      const utterance = new SpeechSynthesisUtterance();
      utterance.text = content;
      window.speechSynthesis.speak(utterance);
    },
    listen(callback) {
      const recognition = new webkitSpeechRecognition()
      recognition.lang = 'zh-CN'
      recognition.onresult = event => {
        this.listening = false
        const count = event.results.length - 1
        const length = event.results[count].length - 1
        const content = event.results[count][length].transcript
      	this.submit(content)
      }
      this.listening = true
      recognition.start()
    },
  }
})
