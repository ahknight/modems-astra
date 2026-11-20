// Editorial copy and citations are kept together so each claim travels with its source.
(() => {
  const itu = name => 'https://www.itu.int/rec/T-REC-' + name + '/en';
  const ref = (name, url) => '<a class="source-link" href="' + url + '">' + name + '</a>';
  const standard = name => ref(name, itu(name));
  const paper = ref('Forney, Brown, Eyuboglu &amp; Moran, 1996', 'https://ptabdata.blob.core.windows.net/files/2018/IPR2018-01634/v21_Ex.%201023%20-%20v34%20standard.pdf');
  const chapters = [
    {
      rate: 300, era: '1970s · Bell 103 compatible', title: 'A pair of whistles',
      deck: 'Type one letter. A little burst of changing pitch travels down one pair of wires. The reply can come back while your finger is still on the key.',
      story: [
        `Imagine a terminal sending the letter H. Between keystrokes its modem is already sounding a steady mark. The start bit shifts the pitch and tells the far terminal when to begin reading the letter. A stop bit returns the line to mark. No keyboard rhythm to match: the next letter can start whenever the typist is ready. The chapter’s signal study sends HELLO from the caller while the answerer holds its mark. ${ref('Heatherington’s 80-103A manual and schematics', 'https://www.wa4dsy.com/heatherington/hayes/downloads.html')}`,
        `In the Bell 103A2 frequency plan, each end had two pitches. The caller used nominally 1,270 Hz for a mark (1) and 1,070 Hz for a space (0). The answerer used 2,225 and 2,025 Hz. The separate pairs let both ends talk at once, or <em>full duplex</em>. A steady mark held the channel between characters. In a common start/stop format, a start bit, eight data bits and a stop bit put ten bits on the wire for each character. At 300 bit/s that gives just 30 characters a second. This exchange needs a shared frequency plan. The international V.21 alternative used different pitches, so matching the speed alone was insufficient. ${ref('Felsenstein’s construction article, p. 43', 'https://nnty.fun/downloads/books/TAEL/MAGAZINES/TECHNICAL/DIY/Popular%20Electronics/1976/Poptronics-1976-03.pdf')} · ${ref('Bell System Practices, table A', 'https://bitsavers.org/communications/westernElectric/modems/591-014-100_Data_Set_103A_Identification_and_Operation_Jan67.pdf')} · ${standard('V.21')}`
      ]
    },
    {
      rate: 1200, era: '1980 · V.22', title: 'Read the turn of a wave',
      deck: 'A pitch can carry more than its name. Change where a wave sits in its cycle and the receiver can read two bits in a single decision.',
      story: [
        `The CCITT’s V.22 standard keeps the caller and answerer in separate frequency bands, centered at nominally 1,200 and 2,400 Hz. Each transmitter makes 600 decisions a second. From one decision to the next the wave can keep its phase, turn a quarter of a cycle, turn halfway or turn three quarters. Those four choices stand for four possible pairs of bits. Compare the arithmetic with Bell 103: twice as many decisions, twice as many bits per decision, four times the line rate. ${standard('V.22')}, §§2.1, 2.5.`,
        `The unit for decisions per second is <em>baud</em>. At 300 bit/s one symbol carried one bit. Here, 600 baud carries 1,200 bit/s. Both ends must also agree on startup and scrambling, the reversible mixing that breaks up repetitive data. V.22 includes optional 600-bit/s operation. AT&amp;T’s earlier Bell 212A was a separate 1,200-bit/s design with its own answer sequence. Its 300-bit/s mode could talk to a Bell 103. A multistandard modem had to recognize the right conversation before it could deliver that first character. ${standard('V.22')}, §§1, 6 · ${ref('CML Microcircuits’ Bell 212A implementation', 'https://cmlmicro.com/Content/Product%20Downloads/Wireline%20Telecom/AN_Telecom_869A_1_May06.pdf')}`
      ]
    },
    {
      rate: 2400, era: '1984 · V.22bis', title: 'Sixteen ways to say it',
      deck: 'Keep the same symbol clock. Give the receiver another clue by varying the size of the wave as well as its phase.',
      story: [
        `V.22bis held each direction at a nominal 600 baud. Imagine a dial with a pointer that can change both angle and length. Its tip can land on sixteen agreed positions, called a <em>constellation</em>. Each position represents four bits, so 600 symbols per second now carry 2,400 bit/s. This combination of phase and amplitude is quadrature amplitude modulation, or QAM. The price is precision: a distorted wave can make neighboring positions hard to distinguish. ${standard('V.22bis')}, §§1–2.`,
        `The CCITT specified an adaptive equalizer to compensate for the way a particular line smears one symbol into the next. During startup a distinctive repeating pattern of bit pairs identifies the faster mode. Both modems must also support 1,200-bit/s operation compatible with specified V.22 modes. Depending on national practice the answering modem might add a guard tone. That extra pitch carried no user data. Two otherwise successful calls could sound different. ${standard('V.22bis')}, §§1, 2.1, 6.`
      ]
    },
    {
      rate: 9600, era: '1984 · V.32', title: 'Subtract your own voice',
      deck: 'The modem already knows every symbol it just sent. What if it learned how those symbols sounded on their way back?',
      story: [
        `CCITT’s V.32 put both directions around the same nominal 1,800 Hz carrier. Each could now use enough of the voice channel to send 2,400 symbols a second. Some outgoing signal inevitably leaked back. During training, known signals let each modem estimate its own echo. In operation it could subtract a predicted copy from the mixture and recover the distant signal underneath. Training took on a new job: learning this particular call’s electrical path. ${standard('V.32')}, §§1, 2, 5.`,
        `At 9,600 bit/s a symbol delivers four information bits. Within the V.32 family, 4,800 bit/s was mandatory and 9,600 optional. Units offering 9,600 had to interoperate with a 16-point uncoded mapping. They could also negotiate a 32-point trellis-coded mapping. Gottfried Ungerboeck at IBM developed the underlying coding principle. Lee-Fang Wei contributed the code used here. Restricting which symbol may follow which lets a receiver consider a whole sequence when noise makes an individual decision ambiguous. ${standard('V.32')}, §1 · ${ref('Ungerboeck’s 1982 paper', 'https://research.ibm.com/publications/channel-coding-with-multilevelphase-signals')} · ${paper}`
      ]
    },
    {
      rate: 14400, era: '1991 · V.32bis', title: 'Six bits at the same beat',
      deck: 'The clock still ticks 2,400 times a second. A denser constellation and a shared set of legal paths through it make each tick worth more.',
      story: [
        `CCITT’s V.32bis brought the trellis-coded family up to 14,400 bit/s. At the top rate, six information bits per symbol select among 128 possible transmitted points with the help of a coding bit. That extra bit gives the receiver a constraint it can use to recover the most likely path. Both ends must implement the five rates from 4,800 to 14,400 in 2,400-bit/s steps. They exchange rate patterns at startup, and either end can later propose another speed without repeating full training. A noisy line can keep the connection alive at a lower rate. ${standard('V.32bis')}, §§1, 4–5, 8.`,
        `Two optional companions explain why a file-transfer display could disagree with the connect message. V.42’s LAPM protocol packages data into checked frames and arranges retransmission when one arrives damaged. V.42bis compresses recurring strings using a shared dictionary over an error-controlled link. A page of repeated text may fly through. An already compressed archive offers little repetition to exploit. Neither changes the agreed symbol clock. ${standard('V.42')} · ${standard('V.42bis')}`
      ]
    },
    {
      rate: 28800, era: '1994 · V.34', title: 'Take the measure of the line',
      deck: 'One call loses its high frequencies. Another arrives almost intact. V.34 spends part of the handshake finding out which line it has.',
      story: [
        `At startup V.8 lets the caller advertise supported modulations and the answerer return a compatible menu. V.34 then sends a comb of probing tones. From the differences between what should arrive and what actually does, the modems can choose a carrier and symbol rate suited to each direction. They train their equalizers and echo cancellers, then exchange parameters before releasing user data. A burst you hear at this point can be a measurement with no letters or file bytes in it at all. ${standard('V.8')} · ${standard('V.34')}, §11.`,
        `The ITU-T’s September 1994 edition reached 28,800 bit/s. More symbols could fit on good lines than under V.32bis, while trellis coding and constellation shaping squeezed more information into the available power. Shaping favors combinations that use less energy on average. G. David Forney Jr., Les Brown, M. Vedat Eyuboglu and John L. Moran III of Motorola describe how the working group combined proposals from several teams. The mandatory symbol rates included 2,400, 3,000 and 3,200 baud. Other negotiated rates let equipment take advantage of more favorable lines. ${standard('V.34')} · ${paper}`
      ]
    },
    {
      rate: 33600, era: '1996 · Revised V.34', title: 'The last few thousand bits',
      deck: 'By now two calls with nearly identical openings can finish at different speeds. The probe measures the line. The negotiated mapping decides how much data it will carry.',
      story: [
        `ITU-T revised V.34 in October 1996. Its two new primary-channel rates, 31,200 and 33,600 bit/s, were optional. The highest rate uses the mode conventionally rounded to 3,429 symbols per second. The 1994 equipment already knew this symbol rate. The revision enlarged the set of usable signal points and defined how to map more bits onto them. On a sufficiently quiet, wide line the receiver can distinguish those closer neighbors. ${ref('1996 V.34, §§1, 6.1 and table 10', itu('V.34-199610-S'))} · ${paper}`,
        `A caller therefore needed compatible implementations at both ends as well as a favorable result from training. A modem using the older edition could still establish a V.34 connection. A 33.6-capable pair might agree on 28.8 or less. The hum of the line probe alone cannot tell you which rate the two machines chose. That information comes in the parameter exchange. ${standard('V.34')}, §11.`
      ]
    },
    {
      rate: 56000, era: '1998 · V.90', title: 'Let the exchange make the wave',
      deck: 'There is one more way to gain speed. Put the answering modem on the digital side of the telephone exchange.',
      story: [
        `In V.90 the provider feeds carefully chosen pulse-code modulation (PCM) values into the digital network. At the local exchange those codes become analog levels on the subscriber’s wire, 8,000 times per second. The home modem trains to distinguish the usable levels after the loop has distorted them. Avoiding an extra analog-to-digital conversion on the downstream trip makes up to 56,000 bit/s possible. In the other direction the exchange still digitizes the subscriber’s waveform, so upstream uses V.34 techniques at up to 33,600 bit/s. ${standard('V.90')}, §§1, 6–9.`,
        `Brent Townshend documented the digital-server approach in his patent. Before V.90, U.S. Robotics’ x2 and the Rockwell/Lucent K56flex camp offered incompatible paths to 56K. An ISP’s choice could determine which modem a subscriber bought. ITU-T formally approved V.90 in September 1998. Its headline number was a ceiling: U.S. Robotics documented a U.S. download limit of 53,333 bit/s for its product, and line impairments could reduce it further. V.92 later added options including PCM upstream and quicker reconnection. ${ref('Townshend’s patent', 'https://patents.google.com/patent/US5801695A/en')} · ${ref('Netfront’s dial-up compatibility notes', 'https://hope.netfront.net/support/dialup/dialupno.htm')} · ${ref('U.S. Robotics installation guide', 'https://support.usr.com/support/5610a/5610a-files/R24.0004.00.pdf')} · ${standard('V.90')} · ${standard('V.92')}`
      ],
      afterword: `After the last training excerpt, a real V.90 pair still has work to do. The home modem can ask the server to send a known test of the digital path. The pair then exchanges final settings and starts carrying data. <strong>CONNECT</strong> appears on the terminal as a local result code. For an Internet call, the computers can now negotiate a PPP link and its network settings. At last the browser has somewhere to send its first request. ${standard('V.90')}, §9 · ${standard('V.250')} · ${ref('IETF RFC 1661', 'https://www.rfc-editor.org/rfc/rfc1661')}`,
      quote: 'So it’s characterizing your channel that’s coming from the central office to your home.',
      credit: ref('Brent Townshend, Computer History Museum oral history, 2022, p. 47', 'https://archive.computerhistory.org/resources/access/text/2022/11/102792696-05-01-acc.pdf')
    }
  ];

  const root = document.getElementById('chapters');
  for (const [index, chapter] of chapters.entries()) {
    root.insertAdjacentHTML('beforeend', `
      <section class="chapter" id="ch-${chapter.rate}" aria-labelledby="title-${chapter.rate}">
        <header class="chapter-head">
          <p class="eyebrow">Chapter ${String(index + 1).padStart(2, '0')} / ${chapter.era}</p>
          <h2 id="title-${chapter.rate}">${chapter.title}</h2>
          <p class="chapter-deck"><strong>${chapter.rate.toLocaleString('en-US')} bit/s.</strong> ${chapter.deck}</p>
        </header>
        <div class="chapter-copy">${chapter.story.map(p => '<p>' + p + '</p>').join('')}</div>
        ${chapter.quote ? '<blockquote><p>“' + chapter.quote + '”</p><cite>' + chapter.credit + '</cite></blockquote>' : ''}
        <signal-player rate="${chapter.rate}"></signal-player>
        ${chapter.afterword ? '<div class="chapter-copy"><p>' + chapter.afterword + '</p></div>' : ''}
      </section>`);
  }

  root.insertAdjacentHTML('beforeend', `
    <section class="chapter epilogue" id="epilogue" aria-labelledby="epilogue-title">
      <header class="chapter-head"><p class="eyebrow">Epilogue / Beyond the voice channel</p>
      <h2 id="epilogue-title">When the speaker went quiet</h2>
      <p class="chapter-deck">The dial-up squeal disappeared from the room. The work of learning a wire and agreeing on a way to use it carried on.</p></header>
      <div class="chapter-copy">
        <h3>ISDN · A digital call from the outset</h3>
        <p>Basic-rate ISDN already coexisted with analog dial-up. It provided two 64-kbit/s B channels for voice or data and a separate 16-kbit/s D channel for signaling. Call setup moved into messages on that signaling channel. One bearer could carry a phone call while the other carried data. Multilink PPP could combine two data calls for a nominal 128 kbit/s before overhead. The familiar idea of establishing a session survived even as the exchange provided digital channels to the user. ${standard('I.430')} · ${ref('IETF RFC 1990, Multilink PPP', 'https://www.rfc-editor.org/rfc/rfc1990')}</p>
        <h3>DSL · Use more of the copper</h3>
        <p>ADSL terminates at telephone-company equipment on the subscriber loop, bypassing the voice-band restriction of a switched call. On lines provisioned for analog voice, filters separate the phone from higher-frequency data. Discrete multitone modulation divides the available spectrum into narrow carriers. Training determines how many bits each can support, so a noisy patch costs capacity locally. John Cioffi and Stanford researchers Jacky Chow, Peter Chow, Minnie Ho and Huiling Lou helped develop this approach. ITU-T standardized ADSL in G.992.1 in 1999. ${standard('G.992.1')} · ${ref('Stanford’s account of the DMT team', 'https://web.stanford.edu/group/OTL/documents/otlar05.pdf')}</p>
        <h3>DOCSIS · Share the television cable</h3>
        <p>The cable industry faced another problem: many subscribers shared a coaxial segment. A modem must range with the operator’s equipment to align arrival times and transmit power, and the operator schedules upstream opportunities. CableLabs dates the preliminary industry specification to 1996 and the final MCNS specification to March 1997. Later DOCSIS 3.1 uses many narrow carriers and adjustable modulation profiles. As in dial-up, the receiver first needs to know what the physical path will allow. Now it also needs to know whose turn it is. ${ref('CableLabs, network primer §§6, 9', 'https://account.cablelabs.com/server/alfresco/4f3782eb-a1d7-4398-bc21-6d12bb70f915')} · ${ref('CableLabs, DOCSIS 3.1 profiles', 'https://account.cablelabs.com/server/alfresco/d534b3f4-3cdc-445b-8d71-e0bdfdb29e0e')}</p>
      </div>
    </section>`);
})();
