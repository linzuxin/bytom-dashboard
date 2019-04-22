import { btmID } from './environment'
import jsPDF from 'jspdf';

const balanceFields = [
  'id' ,
  'type' ,
  'purpose' ,
  'transactionId' ,
  'position' ,
  'assetId' ,
  'assetAlias' ,
  'asset' ,
  'assetDefinition' ,
  'assetTags' ,
  'assetIsLocal' ,
  'amount' ,
  'accountId' ,
  'accountAlias' ,
  'account' ,
  'accountTags' ,
  'controlProgram' ,
  'address' ,
  'programIndex' ,
  'spentOutputId' ,
  'refData' ,
  'sourceId' ,
  'sourcePos' ,
  'issuanceProgram' ,
  'isLocal' ,
  'referenceData' ,
  'change'
]

const txInputFields = [
  'type',
  'asset',
  'account',
  'controlProgram',
  'address',
]

const txOutputFields = [
  'type',
  'id',
  'asset',
  'account',
  'controlProgram',
  'address',
]

const unspentFields = [
  'type',
  'purpose',
  'transactionId',
  'position',
  'assetId',
  'assetAlias',
  'assetDefinition',
  'assetTags',
  'assetIsLocal',
  'amount',
  'accountId',
  'accountAlias',
  'accountTags',
  'controlProgram',
  'programIndex',
  'refData',
  'sourceId',
  'sourcePos',
  'isLocal',
  'referenceData',
  'change',
]

const saveAsPDF = (content) =>{

  if (!window.btoa) {
    var tableStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    var table = tableStr.split("");

    window.btoa = function (bin) {
      for (var i = 0, j = 0, len = bin.length / 3, base64 = []; i < len; ++i) {
        var a = bin.charCodeAt(j++), b = bin.charCodeAt(j++), c = bin.charCodeAt(j++);
        if ((a | b | c) > 255) throw new Error("String contains an invalid character");
        base64[base64.length] = table[a >> 2] + table[((a << 4) & 63) | (b >> 4)] +
          (isNaN(b) ? "=" : table[((b << 2) & 63) | (c >> 6)]) +
          (isNaN(b + c) ? "=" : table[c & 63]);
      }
      return base64.join("");
    };
  }

  //script block
  // try this way  to open you pdf file like this in javascript hope it will help you.
  function hexToBase64(str)
  {
    return btoa(String.fromCharCode.apply(null,str.replace(/\r|\n/g, "").replace(/([\da-fA-F]{2}) ?/g, "0x$1 ").replace(/ +$/, "").split(" ")));
  }

  var data=   hexToBase64(content);// here pass the big hex string

  // it will be open in the web browser like this
  return 'data:application/pdf;base64, ' +data
}

const buildDisplay = (item, fields, btmAmountUnit, t) => {
  const details = []
  const decimals = (item.assetDefinition && item.assetDefinition.decimals && item.assetId !== btmID)?
    item.assetDefinition.decimals: null
  fields.forEach(key => {
    if (item.hasOwnProperty(key)) {
      if(key === 'amount'){
        details.push({
          label: t(`form.${key}`),
          value: decimals? formatIntNumToPosDecimal(item[key], decimals) :normalizeGlobalBTMAmount(item['assetId'], item[key], btmAmountUnit)
        })
      }else if(key === 'asset' && item.assetId !=='0000000000000000000000000000000000000000000000000000000000000000'){
        details.push({
          label:  t(`form.${key}`),
          value: item[key],
          link: `/assets/${item.assetId}`
        })
      }else if(key === 'account'){
        details.push({
          label:  t(`form.${key}`),
          value: item[key],
          link: `/accounts/${item.accountId}`
        })
      }else if(key === 'controlProgram'){
        details.push({
          label:  t(`form.${key}`)+ '\n' + item['index'],
          value: item[key],
          pdf: saveAsPDF(item['retireData']),
          title: item['index']
        })
      }else{
        details.push({label:  t(`form.${key}`), value: item[key]})
      }
    }
  })
  return details
}

const addZeroToDecimalPos = (src,pos) => {
  if(src != null && src !== '' ){
    let srcString = src.toString()
    let rs = srcString.indexOf('.')
    if (rs < 0) {
      rs = srcString.length
      srcString += '.'
    }
    while (srcString.length <= rs + pos) {
      srcString += '0'
    }
    return srcString
  }
  return src
}

const formatIntNumToPosDecimal = (neu,pos) => {
  if(neu != null && neu !== ''){
    let neuString = neu.toString()
    let neuLength = neuString.length
    if(neuLength <= pos){
      let zeros = ''
      while(zeros.length < pos - neuLength){
        zeros += '0'
      }
      return '0.'+ zeros + neuString
    }else {
      return numberWithCommas(neuString.slice(0, -pos) + '.' + neuString.slice(-pos))
    }
  }
  return numberWithCommas(neu)
}

const numberWithCommas = (x) => {
  var parts = x.toString().split('.')
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  return parts.join('.')
}

export const normalizeGlobalBTMAmount = (assetID, amount, btmAmountUnit) => {
  //normalize BTM Amount
  if (assetID === btmID) {
    switch (btmAmountUnit){
      case 'BTM':
        return formatIntNumToPosDecimal(amount, 8)+' BTM'
      case 'mBTM':
        return formatIntNumToPosDecimal(amount, 5)+' mBTM'
      case 'NEU':
        return amount+' NEU'
    }
  }
  return amount
}

export const normalizeBTM = (amount, btmAmountUnit) => {
  switch (btmAmountUnit){
    case 'BTM':
      return formatIntNumToPosDecimal(amount, 8)+' BTM'
    case 'mBTM':
      return formatIntNumToPosDecimal(amount, 5)+' mBTM'
    case 'NEU':
      return amount+' NEU'
  }
}

export function formatBTMAmount(value, pos)  {
  if (!value) {
    return value
  }

  const onlyNums = value.toString().replace(/[^0-9.]/g, '')

  // Create an array with sections split by .
  const sections = onlyNums.split('.')

  // Remove any leading 0s apart from single 0
  if (sections[0] !== '0' && sections[0] !== '00') {
    sections[0] = sections[0].replace(/^0+/, '')
  } else {
    sections[0] = '0'
  }

  // If numbers exist after first .
  if (sections[1]) {
    return sections[0] + '.' + sections[1].slice(0, pos)
  } else if (onlyNums.indexOf('.') !== -1 && pos !== 0) {
    return sections[0] + '.'
  } else {
    return sections[0]
  }
}

export function parseBTMAmount(value, pos){
  if (!value) {
    return value
  }

  const onlyNums = value.replace(/[^0-9.]/g, '')
  const sections = onlyNums.split('.')

  let numDecimal = ''

  if (sections[1]) {
    numDecimal = sections[1].slice(0, pos)
  }
  while (numDecimal.length < pos) {
    numDecimal += '0'
  }

  //remove all the leading 0s
  let amountNum = sections[0] + numDecimal
  if(/^0*$/.test(amountNum)){
    amountNum = '0'
  }else {
    amountNum = amountNum.replace(/^0+/, '')
  }

  return amountNum
}

export function normalizeBTMAmountUnit(assetID, amount, btmAmountUnit) {
  return normalizeGlobalBTMAmount(assetID, amount, btmAmountUnit)
}

export function addZeroToDecimalPosition(value, deciPoint){
  return addZeroToDecimalPos(value, deciPoint)
}

export function converIntToDec(int, deciPoint){
  return formatIntNumToPosDecimal(int, deciPoint)
}

export function buildTxInputDisplay(input, btmAmountUnit, t) {
  return buildDisplay(input, txInputFields, btmAmountUnit, t)
}

export function buildTxOutputDisplay(output, btmAmountUnit, t) {
  return buildDisplay(output, txOutputFields, btmAmountUnit, t)
}

export function buildUnspentDisplay(output, btmAmountUnit, t) {
  const normalized = {
    amount: output.amount,
    accountId: output.accountId,
    accountAlias: output.accountAlias,
    assetId: output.assetId,
    assetAlias: output.assetAlias,
    controlProgram: output.program,
    programIndex: output.controlProgramIndex,
    sourceId: output.sourceId,
    sourcePos: output.sourcePos,
    change: output.change + ''
  }
  return buildDisplay(normalized, unspentFields, btmAmountUnit, t)
}

export function buildBalanceDisplay(balance, btmAmountUnit, t) {
  let amount = (balance.assetDefinition && balance.assetDefinition.decimals && balance.assetId !== btmID)?
    formatIntNumToPosDecimal(balance.amount, balance.assetDefinition.decimals): balance.amount
  return buildDisplay({
    amount: amount,
    assetId: balance.assetId,
    assetAlias: balance.assetAlias,
    accountAlias: balance.accountAlias
  }, balanceFields, btmAmountUnit, t)
}
