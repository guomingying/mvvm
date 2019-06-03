

class Dep{
    constructor() {
        this.listenFunc = []
    }
    addFun(target) {
        this.listenFunc.push(target)
    }
    targetDo() {
        this.listenFunc.forEach(val => {
            val.changeHtml()
        })
    }
}
Dep.target = null;
const dep = new Dep();
class Observer{
    constructor(data) {
        if (!data || typeof data !== 'object') {
            return;
        }
        this.data = data;
        this.init()
    }
    init() {
        Object.keys(this.data).forEach(val => {
            this.observer(this.data, val, this.data[val])
        })
    }
    observer(object, key, val) {
        new Observer(object[key]);
        Object.defineProperty(object, key, {
            get() {
                if (Dep.target) {
                    dep.addFun(Dep.target)
                }
                return val;
            },
            set(newValue) {
                if (val === newValue) {
                    return;
                }
                val = newValue;
                dep.targetDo()
                new Observer(val)
            }
        })
    }
}




class Watcher {
    constructor(data, key, cbk) {
        Dep.target = this;
        this.data = data;
        this.key = key;
        this.cbk = cbk;
        this.init()
    }
    init() {
        this.value = utils.getValue(this.data, this.key);
        Dep.target = null;
        return this.value;
    }
    changeHtml() {
        let newValue = this.init()
        this.cbk(newValue);
    }
}


const utils = {
    setValue(data, node, attr) {
        node.value = this.getValue(data, attr)
    },
    getValue(data, attr) {
        if(attr.indexOf('.') > -1) {
            attr.split('.').forEach(val => {
                data = data[val]
            })
        } else {
            data = data[attr]
        }
        return data
    },
    changeKey(data, key, val) {
        let newData = data;
        let newValues = key.split('.')
        if(key.indexOf('.') > -1) {
            for(let i = 0; i < newValues.length - 2; i++) {
                newData = newData[newValues[i]]
            }
            newData[newData[newData.length - 1]] = val;
        } else {
            newData[key] = val
        }
    },
    getContent(node, data, content) {
        new Watcher(data, content, (newValue) => {
            node.textContent = newValue
        });
        node.textContent = this.getValue(data, content);
    }
}



class Mvvms{
    constructor({el, data}) {
        console.log({el,data})
        this.el = el;
        this.data = data;
        this.init();
        this.initDom()
    }
    init() {
        this.$el = document.getElementById(this.el);
        Object.keys(this.data).forEach((val, ind) => {
            this.setObServer(this, val, this.data[val])
        })
        this.$el.addEventListener('click', () => {
            this.data.value = '我要改变'
        })
        new Observer(this.data);
    }
    setObServer(object, key, val) {
        Object.defineProperty(object, key, {
            get() {
                return val
            },
            set(newValue) {
                val = newValue
            }
        })
    }
    initDom() {
        let newFargment = this.createFargment();
        this.compiler(newFargment);
        this.$el.appendChild(newFargment)
    }
    compiler(compiler) {
        if (compiler.nodeType === 1) {
            let attrs = compiler.attributes;
            Array.from(attrs).forEach(val => {
                if(val.nodeName.indexOf('v-model') > -1) {
                    new Watcher(this.data, val.nodeValue, (newValue) => {
                        compiler.value = newValue;
                    })
                    utils.setValue(this.data, compiler, val.nodeValue);
                    compiler.addEventListener('input', (e) => {
                        utils.changeKey(this.data, val.nodeValue, e.target.value)
                    })
                }
            })
        } else if (compiler.nodeType === 3) {
            let reg = /\{\{(\w+\.?\w+)\}\}/;
            if (reg.test(compiler.textContent)) {
                utils.getContent(compiler, this.data, compiler.textContent.match(reg)[1])
            }
        }
        if (compiler.childNodes && compiler.childNodes.length > 0) {
            compiler.childNodes.forEach(val => this.compiler(val))
        }
    }
    createFargment() {
        let newFargment = document.createDocumentFragment();
        let firstChild;
        while(firstChild = this.$el.firstChild) {
            newFargment.appendChild(firstChild)
        }
        return newFargment
    }
}