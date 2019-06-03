class Observer{
    constructor(data){
        if(!data || typeof data !== 'object'){
            return;
        }
        this.data=data
        // console.log(this,'observer')
        this.init()
    }
    init(){
        Object.keys(this.data).forEach(val=>{
            this.observer(this.data,val,this.data[val])
        }) 
    }
    observer(obj,key,value){
        // console.log(value)
        new Observer(obj[key])
        Object.defineProperty(obj,key,{
            get(){
                if(Dep.target){
                    dep.addFunc(Dep.target)
                }
                return value
            },
            set(newValue){
                if(value===newValue){
                    return;
                }
                // console.log(newValue)
                value=newValue
                dep.changeWatch()
                new Observer(value)
            }
        })
    }
}
const utils = {
    setValue(node,data,key){
        node.value = this.getValue(data,key)
    },
    getValue(data,key){
        if(key.indexOf('.')>-1){
            let arr=key.split('.')
            for(let i=0;i<arr.length;i++){
                data=data[arr[i]]
            }
            return data
        }else{
            return data[key]
        }
        
    },
    getContent(node,key,data){
        // console.log(node.textContent)
        node.textContent=this.getValue(data,key)
    },
    changeKeyVal(data,key,newVal){
        if(key.indexOf('.')>-1){
            let arr=key.split('.')
            for(let i=0;i<arr.length-1;i++){
                data=data[arr[i]]
            }
            data[arr[arr.length-1]]=newVal
         
        }else{
            data[key]=newVal
        }
    }
}

class Dep{
    constructor(){
        this.listenFunc=[]
    }
    addFunc(obj){
        this.listenFunc.push(obj)
        console.log(this.listenFunc)
    }
    changeWatch(){
        this.listenFunc.forEach(val=>{
            val.sendVal()
        })
    }
}

Dep.target=null;
const dep=new Dep()
class Watcher{
    constructor(data,key,cbk){
        Dep.target=this;
        this.data=data;
        this.key=key;
        this.cbk=cbk;
        console.log(this)
        this.init()
    }
    init(){
        this.value=utils.getValue(this.data,this.key)
        console.log(this.value)
        Dep.target=null;
        return this.value
    }
    sendVal(){
        let newVal=this.init()
        this.cbk(newVal)
    }
}
class Mvvms{
    constructor(e){
        this.el=e.el;
        this.data=e.data
        // console.log(this,'Mvvms')
        this.init()
        this.initDom()
    }
    init(){
       Object.keys(this.data).forEach(val=>{
           this.observer(this,val,this.data[val])
       }) 
       new Observer(this.data)
    }
    observer(obj,key,value){
        // console.log(value)
        Object.defineProperty(obj,key,{
            get(){
                return value
            },
            set(newValue){        
                console.log(newValue)
                value=newValue
            }
        })
    }
    initDom(){
        this.$el=document.getElementById(this.el)
        let newFargment = this.createFragment() 
        // console.log(newFargment)
        this.compiler(newFargment)
        this.$el.appendChild(newFargment)
    }
    // 因为遍历解析的过程有多次操作dom节点，为提高性能和效率，会先将跟节点el转换成文档碎片fragment进行解析编译操作，
    // 解析完成，再将fragment添加回原来的真实dom节点中
    createFragment(){
        let newFrrragment = document.createDocumentFragment();
        // console.log(this.$el)
        let firstChild;
        while(firstChild = this.$el.firstChild) {
            newFrrragment.appendChild(firstChild)
        }
        // console.log(this.$el)
      
        return newFrrragment;
    }
    compiler(node){
        // console.log(node.nodeType,'node',node,'jjj',node.textContent)
        // console.dir(node)
        if(node.nodeType===1){
            // console.dir(node)
            // console.log(node,node.attributes)
            let attributes=node.attributes;
            Array.from(attributes).forEach(val=>{
                // console.log(val,'dddddatt')
              if(val.nodeName==="v-model"){
                //  node.value="gmy"
                console.log(node,this.data,val.nodeValue)
                node.addEventListener('input',(e) => { 
                    // console.log('rrr    ',e.target.value)
                    utils.changeKeyVal(this.data,val.nodeValue,e.target.value)
                })
                utils.setValue(node,this.data,val.nodeValue)
              }
            })
            
        }else if(node.nodeType===3){
     
            let contentVal = node.textContent.indexOf("{{") > -1 && node.textContent.split('{{')[1].split('}}')[0];
            console.log(node,contentVal,this.data)
            contentVal && utils.getContent(node,contentVal,this.data)
            contentVal && new Watcher(this.data,contentVal,(newVal)=>{
                // console.log(newVal,'xinxin')
                node.textContent=newVal
            })
        }
        if(node.childNodes && node.childNodes.length>0){
            node.childNodes.forEach(val=>{
                this.compiler(val)
            })
        }
    }
}