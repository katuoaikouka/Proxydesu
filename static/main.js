const form = document.getElementById('uv-form');
const address = document.getElementById('uv-address');
const blankBtn = document.getElementById('blank-btn');

// Service Workerの登録（エラーハンドリング付き）
async function registerSW() {
    try {
        return await window.navigator.serviceWorker.register('./sw.js', {
            scope: __uv$config.prefix
        });
    } catch (err) {
        console.error('SW Registration Failed:', err);
        throw err; // エラーを呼び出し元に投げる
    }
}

// URL生成ロジック
function getUrl(val) {
    if (/^http(s?):\/\//.test(val) || (val.includes('.') && val.substr(0, 1) !== ' ')) return val;
    return 'https://www.google.com/search?q=' + encodeURIComponent(val);
}

// メインの送信処理
form.addEventListener('submit', async event => {
    event.preventDefault();
    
    try {
        await registerSW();

        let url = address.value.trim();
        let target = getUrl(url);
        if (!target.startsWith('http')) target = 'http://' + target;

        // エンコード処理
        const encodedUrl = __uv$config.prefix + __uv$config.encodeUrl(target);
        
        // 遷移実行
        window.location.href = encodedUrl;
    } catch (error) {
        // エラーが発生したら error.html へ
        window.location.href = 'error.html';
    }
});

// About:Blankで開く処理
blankBtn.addEventListener('click', async () => {
    try {
        await registerSW();
        
        let url = address.value.trim() || 'https://google.com';
        let target = getUrl(url);
        if (!target.startsWith('http')) target = 'http://' + target;

        const proxyUrl = window.location.origin + __uv$config.prefix + __uv$config.encodeUrl(target);

        const win = window.open();
        if (!win) {
            alert("ポップアップがブロックされました。");
            return;
        }

        win.document.body.style.margin = '0';
        win.document.body.style.height = '100vh';
        
        const iframe = win.document.createElement('iframe');
        iframe.style.border = 'none';
        iframe.style.width = '100%';
        iframe.style.height = '100%';
        iframe.src = proxyUrl;

        win.document.body.appendChild(iframe);
    } catch (error) {
        window.location.href = 'error.html';
    }
});
