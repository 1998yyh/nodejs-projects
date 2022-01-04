class Packer {
  constructor(w, h) {
    this.root = {
      x: 0,
      y: 0,
      width: w,
      height: h
    }

    this.usedArea = { width: 0, height: 0 };
    this.levelBlocks = [];
  }

  // 匹配方格
  fit(blocks) {
    let node;
    for (let i = 0; i < blocks.length; i++) {
      let block = blocks[i]
      node = this.findNode(this.root,block.width,block.height);
      if(node){
        let fit = this.findEmptyNode(node,block.width,block.height);
        block.x = fit.x;
        block.y = fit.y;
        // block.fit = fit;
        this.usedArea = {
          width: Math.max(this.usedArea.width, block.width + block.x),
          height: Math.max(this.usedArea.height, block.height + block.y)
      };
      }else{
        blocks.splice(i,1);
        this.levelBlocks.push(block)
      }
    }
  }


  findNode(node, w, h) {
    if (node.used) {
      return this.findNode(node.rightArea, w, h) || this.findNode(node.downArea, w, h);
    } else if (node.width >= w && node.height >= h) {
      return node;
    } else {
      return null;
    }
  }

  findEmptyNode(node,w,h){
    node.used = true;
    node.rightArea = {
      x:node.x + w,
      y:node.y,
      width:node.width - w,
      height:h,
    }

    node.downArea = {
      x:node.x,
      y:node.y+h,
      width:node.width,
      height:node.height - h,
    }

    return node;
  }
}

module.exports = Packer
