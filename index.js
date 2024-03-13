import puppeteer from 'puppeteer';
import { Telegraf } from 'telegraf'

(async () => {

  const bot = new Telegraf('7194543683:AAGywClqb7MytD02Lo8m2pDM6I-PKYG4Q3w');
  const canal = '-1002057252627'

  // bot.use((ctx) => {
  //   console.log(ctx.update)
  // })

  let valoresPlataforma = [];
  let contador = 0;
  const maxExecucoes = 3;

  await analizador()

  async function analizador() {

    console.log('rodando analizador')

    const intervalId = setInterval(async () => {
      valoresPlataforma.push(await getTextFromPage());

      contador++;

      console.log(contador);

      if (contador === maxExecucoes) {

        if (Number(valoresPlataforma[0]) < Number(valoresPlataforma[1]) && Number(valoresPlataforma[1]) < Number(valoresPlataforma[2])) {

          console.log(valoresPlataforma, 'true')
          await enviarMensagemPut()
          clearInterval(intervalId)

        } else {

          console.log(valoresPlataforma, 'false para Putt')

        }

        if (Number(valoresPlataforma[0]) > Number(valoresPlataforma[1]) && Number(valoresPlataforma[1]) > Number(valoresPlataforma[2])) {

          console.log(valoresPlataforma, 'true')
          await enviarMensagemCall()
          clearInterval(intervalId)

        } else {

          console.log(valoresPlataforma, 'false para Call')

        }

        contador = 0;
        valoresPlataforma = []
      }


    }, 60000); // Executa a cada minuto (60000 milissegundos)

  }

  async function getTextFromPage() {
    const browser = await puppeteer.launch({
      headless: true,
      args:[
        '--no-sandbox',
      ]
    });
    const page = await browser.newPage();
    await page.goto('https://simple-trader.broption.com/?show-login&_gl=1*1jahazv*_ga*OTc2NTU0MTguMTcwOTA0NjIyMA..*_ga_JZX2PDWXVX*MTcwOTA1NDk1MC4yLjEuMTcwOTA1NDk2Mi4wLjAuMA..');

    // const fecharLogin = '#root > div > div > div.chartContainer > div.sc-dLMFU.kJkOja > form > svg > g > g > g > g > g > path';
    // await page.waitForSelector(fecharLogin);
    // await page.click(fecharLogin);

    const agulha = '.highcharts-label';
    await page.waitForSelector(agulha);

    const text = await page.evaluate((agulha) => {
      const element = document.querySelector(agulha);
      return element ? element.textContent : null;
    }, agulha);

    await browser.close();
    console.log(text);
    return text;
  }

  async function enviarMensagemPut() {
    const text = await getTextFromPage();
    const hora = horaMinutos();

    bot.telegram.sendMessage(canal, `
      💰 OPORTUNIDADE ENCONTRADA 💰

      📊 Par de Moeda - EUR/USD
      ➡️ Ordem - PUT 🔴
      ⏰ Horário - ${hora}  
      ⏳ Expiração - 1 minutos 
      Se necessário use até 2 proteção

      📲  <a href="https://afiliados.broption.com/click.php?ctag=a505-b1-p" >Clique na plataforma para abrir a corretora</a>
    `, { parse_mode: 'HTML', disable_web_page_preview: true });

    setTimeout(async () => {

      const valorPos5min = await getTextFromPage()

      if (Number(text) > Number(valorPos5min)) {
        console.log(text, valorPos5min);

        bot.telegram.sendMessage(canal, `
        Entrada finalizada ✅
      `);

        await analizador();

      } else {
        console.log(text, valorPos5min);

        bot.telegram.sendMessage(canal, `
        Entrada finalizada ✅
        `);

        await analizador();
      }
    }, 60000);


  }

  async function enviarMensagemCall() {
    const text = await getTextFromPage();
    const hora = horaMinutos();

    bot.telegram.sendMessage(canal, `
    💰 OPORTUNIDADE ENCONTRADA 💰

    📊 Par de Moeda - EUR/USD
    ➡️ Ordem - PUT 🔴
    ⏰ Horário - ${hora}  
    ⏳ Expiração - 1 minutos 
    Se necessário use até 2 proteção

    📲  <a href="https://afiliados.broption.com/click.php?ctag=a505-b1-p" >Clique na plataforma para abrir a corretora</a>
    `, { parse_mode: "HTML", disable_web_page_preview: true });

    setTimeout(async () => {

      const valorPos5min = await getTextFromPage()
      if (Number(text) < Number(valorPos5min)) {

        console.log(text, valorPos5min);

        bot.telegram.sendMessage(canal, `
        Entrada finalizada ✅
      `);
        await analizador()

      } else {

        console.log(text, valorPos5min);
        bot.telegram.sendMessage(canal, `
        Entrada finalizada ✅
      `);
        await analizador();

      }
    }, 60000);

  }

  function horaMinutos() {
    const expiryTime = 0; // tempo de expiração em minutos
    const now = new Date();
    const expiry = new Date(now.getTime() + expiryTime * 60 * 1000);
    const hours = String(expiry.getHours()).padStart(2, '0');
    const minutes = String(expiry.getMinutes()).padStart(2, '0');
    return hours + ':' + minutes;
  }

  bot.launch();

})();
