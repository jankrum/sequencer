(function(){"use strict";let e;self.onmessage=a=>{a.data===0?(e&&clearInterval(e),e=setInterval(()=>postMessage(2),25)):a.data===1&&clearInterval(e)}})();
