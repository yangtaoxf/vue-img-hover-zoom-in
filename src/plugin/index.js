/*
 * @Author: guidetheorient
 * @Date: 2018-05-17 09:26:15
 * @Last Modified by: guidetheorient
 * @Last Modified time: 2018-11-06 13:13:23
 */
import hoverImgComponent from './index.vue'

const hoverZoomImg = {
  install (Vue, options = {}) {
    let { offsetMouseX, offsetMouseY, delayShow, delayHide, imgSrcFormat } = options
    if (typeof offsetMouseX !== 'number' ||
      typeof offsetMouseX !== 'number') {
      console.log(`
          offsetMouseX and offsetMouseX must be number type.
        `)
      offsetMouseX = offsetMouseY = 0
    }

    const hoverImgExtend = Vue.extend(hoverImgComponent)

    let instance
    if (!instance) {
      instance = new hoverImgExtend({
        el: document.createElement('div'),
        data: {
          offsetMouseX,
          offsetMouseY
        },
        // TODO: 这样合并？
        methods: {
          imgSrcFormat
        }
      })
      // console.log(instance, 'instance');
      document.querySelector('body').style.position = 'relative'
      document.querySelector('body').appendChild(instance.$el)
    }

    document.addEventListener('click', e => {
      Vue.nextTick(() => {
        instance.setCanShow(true)
      })
    })
    document.addEventListener('contextmenu', (e) => {
      instance.setCanShow(false)
    })
    document.addEventListener('mousemove', (e) => {
      instance && instance.setEvent(e)
    })

    Vue.directive('hover-zoom-img', {
      bind (el, binding) {
        // console.log(el, binding, 'binding');
        let { containerId } = binding.value
        instance.containerId = containerId
        el.addEventListener('mouseenter', (e) => {
          instance.setShow(true)
        })
        el.addEventListener('mouseleave', (e) => {
          instance.setShow(false)
        })
      },
      inserted () {
        // 每个元素都绑定了一遍，感觉哪里不对
        !instance.canShow && instance.setCanShow(true)
        // console.log('inserted')
      },
      unbind () {
        instance.canShow && instance.setCanShow(false)
        instance.show && instance.setShow(false)
        console.log('unbind')
      }
    })
  }
}

export default hoverZoomImg