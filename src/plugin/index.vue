<template>
  <div class="hover-zoom-img-wrapper" v-if="canShow && show" :style="{left: imgL, top: imgT}">
    <img class="hover-zoom-img" :src="imgSrc" :style="{width: imgW, height: imgH}">
  </div>
  <!-- <transition name="fade"> -->
    <!-- <div class="hover-zoom-img-wrapper" v-if="canShow && show && imgSrc && aspectRatio" :style="{left: imgL, top: imgT}">
      <img class="hover-zoom-img" :src="imgSrc" :style="{width: imgW, height: imgH}">
    </div> -->
  <!-- </transition> -->
</template>

<script>
import helpers from './helpers'

export default {
  data () {
    return {
      documentDims: {}, // document/body的尺寸信息

      containerId: '', // 放大图所在容器id
      ctDims: {}, // 放大图所在容器尺寸对象

      offsetMouseX: 0, // 离鼠标距离x
      offsetMouseY: 0, // 离鼠标距离y

      e: null, // event对象
      show: true, // 是否显示
      canShow: true, // 是否允许显示
      // delayShow: .5, // 延迟显示
      // delayHide: .3, // 延迟隐藏

      // 最终位置
      imgW: '',
      imgH: '',
      imgL: '',
      imgT: ''
    }
  },
  computed: {
    imgEle () {
      let imgSrc = ''
      if (this.e &&
        this.e.target &&
        this.e.target.tagName.toLowerCase() === 'img' &&
        this.e.target.classList.contains('hover-img')) {
        imgSrc = this.e.target.getAttribute('src')
        imgSrc = this.imgSrcFormat(imgSrc)

        let img = new Image()
        img.src = imgSrc
        return img
      }
      return null
    },
    imgSrc () {
      let src = this.imgEle && this.imgEle.getAttribute('src')
      return src || ''
    },
    aspectRatio () {
      // complete不能判断图片加载成功或失败， 加载失败naturalHeight也不为0；
      if (helpers.isImgLoaded(this.imgEle)) {
        return this.imgEle.naturalWidth / this.imgEle.naturalHeight
      }
      return false
    },
    // 容器四个边界点坐标，顺序：顺时针
    ctBorderPoints () {
      let points = []
      if (Object.keys(this.ctDims)) {
        points = [
          { x: 0, y: 0 },
          { x: this.ctDims.width, y: 0 },
          { x: this.ctDims.width, y: this.ctDims.height },
          { x: 0, y: this.ctDims.height }
        ]
      }
      return points
    }
  },
  methods: {
    // 获取图片src默认function
    imgSrcFormat (src) {
      return src
    },
    // 获取document.body的尺寸信息
    _getDocumentDims () {
      let height = document.documentElement.clientHeight || document.body.clientHeight
      let width = document.documentElement.clientWidth || document.body.clientWidth
      this.documentDims = { height, width }
    },
    // 计算放大图所在容器的边界尺寸
    _computeContainerDimension (el) {
      let ctDims = {
        borderLeft: 0,
        borderRight: 0,
        borderTop: 0,
        borderBottom: 0,
        width: 0,
        height: 0
      }
      // 传入了id选择器
      if (el) {
        let dimension = el.getBoundingClientRect()
        ctDims.borderLeft = dimension.left
        ctDims.borderRight = parseInt(this.documentDims.width - dimension.right)
        ctDims.borderTop = dimension.top
        ctDims.borderBottom = parseInt(this.documentDims.height - dimension.bottom)
        ctDims.width = dimension.width
        ctDims.height = dimension.height
      }
      // 默认为body
      else {
        ctDims.height = document.documentElement.clientHeight || document.body.clientHeight
        ctDims.width = document.documentElement.clientWidth || document.body.clientWidth
      }
      this.ctDims = ctDims
    },
    // 设置event对象
    setEvent (e) {
      this.e = e
    },
    // 设置是否可以显示；以下情况不可以显示 1.右键菜单
    setCanShow (flag) {
      this.canShow = flag
    },
    setShow (flag) {
      this.show = flag
    },
    // 获取图片显示位置的矩形对角点
    _getPoints (point) {
      let halfX = this.ctDims.width / 2
      let halfY = this.ctDims.height / 2
      let pointA, pointB
      if (halfX >= point.x && halfY >= point.y) {
        pointA = {
          x: point.x + this.offsetMouseX,
          y: point.y + this.offsetMouseY
        }
        pointB = this.ctBorderPoints[2]
      } else if (halfX < point.x && halfY >= point.y) {
        pointA = {
          x: point.x - this.offsetMouseX,
          y: point.y + this.offsetMouseY
        }
        pointB = this.ctBorderPoints[3]
      } else if (halfX < point.x && halfY < point.y) {
        pointA = {
          x: point.x - this.offsetMouseX,
          y: point.y - this.offsetMouseY
        }
        pointB = this.ctBorderPoints[0]
      } else if (halfX >= point.x && halfY < point.y) {
        pointA = {
          x: point.x + this.offsetMouseX,
          y: point.y - this.offsetMouseY
        }
        pointB = this.ctBorderPoints[1]
      }
      return { pointA, pointB }
    },
    // 获取图片实际宽高
    _getImgDims (width, height, aspectRatio) {
      if (width / height > aspectRatio) {
        width = height * aspectRatio
      } else {
        height = width / aspectRatio
      }
      return { imgW: width, imgH: height }
    },
    // 获取图片位置信息
    /**
     * @param {number} width 图片宽度
     * @param {number} height 图片高度
     * @param {Object: {x: number,y: number}} point 鼠标所在位置
     * @param {Object: {x: number,y: number}} pointA 鼠标经过偏移后的位置
     * */
    _getImgPos (width, height, point, pointA) {
      let halfX = this.ctDims.width / 2
      let halfY = this.ctDims.height / 2
      let imgL, imgT
      if (halfX > point.x && halfY > point.y) {
        imgL = pointA.x
        imgT = pointA.y
      } else if (halfX < point.x && halfY > point.y) {
        imgL = pointA.x - width
        imgT = pointA.y
      } else if (halfX < point.x && halfY < point.y) {
        imgL = pointA.x - width
        imgT = pointA.y - height
      } else if (halfX > point.x && halfY < point.y) {
        imgL = pointA.x
        imgT = pointA.y - height
      }
      return { imgL, imgT }
    }
  },
  watch: {
    containerId (id) {
      let containerEl = document.getElementById(id)
      this._computeContainerDimension(containerEl)
    },
    e (val) {
      if (!val || !this.canShow || !this.ctDims.width) return
      // console.log(this.canShow, this.show, this.aspectRatio, this.imgSrc, this.imgEle)
      // if(!this.canShow || !this.show || !this.aspectRatio || !this.imgEle) return;
      let eRelativePos = {
        x: this.e.pageX - this.ctDims.borderLeft,
        y: this.e.pageY - this.ctDims.borderTop
      }
      // 超过容器范围，不显示
      // 容器边界点还没有，不显示
      // 图片没有宽高比，不显示
      if (eRelativePos.x <= 0 ||
        eRelativePos.y <= 0 ||
        eRelativePos.x >= this.ctDims.width ||
        eRelativePos.y >= this.ctDims.height ||
        !this.ctBorderPoints.length ||
        !this.aspectRatio
      ) {
        this.setShow(false)
        return
      }
      let { pointA, pointB } = this._getPoints(eRelativePos)
      // 图片最大可用宽高
      let imgMaxW = Math.abs(pointB.x - pointA.x)
      let imgMaxH = Math.abs(pointB.y - pointA.y)
      // console.log('aspectRatio',this.aspectRatio);
      let { imgW, imgH } = this._getImgDims(imgMaxW, imgMaxH, this.aspectRatio)
      let { imgL, imgT } = this._getImgPos(imgW, imgH, eRelativePos, pointA)
      this.imgW = imgW + 'px'
      this.imgH = imgH + 'px'
      this.imgL = imgL + this.ctDims.borderLeft + 'px'
      this.imgT = imgT + this.ctDims.borderTop + 'px'

      !this.show && this.setShow(true)
    }
  },
  mounted () {
    this._getDocumentDims()
  }
}
</script>

<style lang="scss" scoped>
.hover-zoom-img-wrapper {
  pointer-events: none;
  position: fixed;
  z-index: 3000;
  transition: all .2s;
  .hover-zoom-img {
    border: 5px solid #eee;
    border-radius: 5px;
    background-color: #eee;
    box-shadow: 0 2px 12px 0 rgba(0,0,0,.1);
  }
}

</style>