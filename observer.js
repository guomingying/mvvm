function observer(data) {
    if (!data || typeof data !== 'object') {
        return;
    }
    // 取出所有属性遍历
    Object.keys(data).forEach(function(key) {
        defineReactive(data, key, data[key]);
    });
};

function defineReactive(data, key, val) {
    var dep = new Dep();
    observer(val); // 监听子属性
    Object.defineProperty(data, key, {
        enumerable: true, // 可枚举
        configurable: false, // 不能再define
        get: function() {  //订阅
            // console.log('获取了'+key)
            // dep.addSub('某某订阅者')
        //    dep.addSub(new Watcher())
         Dep.target && dep.addSub(Dep.target)
            console.log(dep.subs)
            return val;
        },
        set: function(newVal) { //发布
            console.log('哈哈哈，监听到值变化了 ', key, ' --> ', newVal);
            val = newVal;
            dep.notify('该更新视图了',val)// 通知所有订阅者
            setAppHtml()
        }
    });
}  
