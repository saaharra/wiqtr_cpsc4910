/*Sarah Nguyen
Hw #3
script.js
*/

function registerButtonCallBacks() {
    const button = document.querySelector('button')
    button.addEventListener('click', event => {
      event.preventDefault()
      // the main method to run your script
      runScript()
      })
  }

async function postWithData(path, data)
{
    const postResponse = await fetch(path, {
        method: 'POST',
        headers : {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
}

async function postWithText(path, data){
    await fetch(path, {
        method: 'POST',
        body: data
    })
}

async function getCrewMemberID() {
    let response = await fetch('/join', { method: 'POST' })
    // response.json() === response.text().then(text => JSON.parse(text))
    return await response.text()
}


async function getNextTask(crewMemberID)
{
    let response = await fetch('/crew/' + crewMemberID + '/tasks/next', {
        method:"GET"
    })
    return await response
}

/*
cleaning1: the response will contain an array of numbers. 
Remove all of the duplicates and then POST the de-duplicated array.
*/
async function cleaning1(crewMemberID)
{
    // console.log('in cleaning1 function')
    const currentPath = '/crew/' + crewMemberID + '/tasks/' + 'cleaning1'
    const response = await fetch(currentPath, {
        method:"GET"
    })

    let givenIntArr = await response.json()
    //console.log('givenIntArr = ' + givenIntArr)

    let noDupArr = []

    for(i = 0; i < givenIntArr.length; i++){
        if(noDupArr.indexOf(givenIntArr[i]) === -1) {
            noDupArr.push(givenIntArr[i]);
        }
    }
    //console.log('noDupArr = ' + noDupArr)
    postWithData(currentPath, noDupArr)
}


/*
cleaning2: the response will contain an array of strings. 
Some of the strings will contain valid numbers, others will not. 
Separate the strings into two arrays and POST them in a JSON object under "numbers" and "non-numbers".
*/

async function cleaning2(crewMemberID)
{
    //console.log('in cleaning2 function')
    const currentPath = '/crew/' + crewMemberID + '/tasks/' + 'cleaning2'
    const response = await fetch(currentPath, {
        method:"GET"
    })

    let givenArr = await response.json()
    // console.log('givenArr = ' + givenArr)

    let numsArr = []
    let stringsArr = []

    for(i = 0; i < givenArr.length; i++) {
        if(isNaN(givenArr[i])){
            stringsArr.push(givenArr[i])
        } else {
            numsArr.push(givenArr[i])
        }
    }

    var obj = {"numbers" : numsArr, "non-numbers" : stringsArr}

   //console.log('numsArr = ' + numsArr)
   //console.log('stringsArr = ' + stringsArr)
   postWithData(currentPath, obj)
}

/*
decoding: the response will contain a message that you need to decode and a key to decoding the message. 
You will need to use the key to transform each integer in the message, then POST the result.
*/

async function decoding(crewMemberID)
{
    // console.log('in decoding function')
    const currentPath = '/crew/' + crewMemberID + '/tasks/' + 'decoding'
    const response = await fetch(currentPath, {method:"GET"})
    
    var obj = await response.json()
    //console.log('obj = ' + obj)
    const messages = obj.message
    console.log('int = ' + messages )
    var secretmsg = ""
   // let responseArr = await response.json()
    //console.log('responseArr ' + responseArr)
    messages.forEach(position => {
        secretmsg += obj.key[position]
    })
    console.log('msg = ' + secretmsg)
    postWithText(currentPath, secretmsg)
}

/*
repair: the response will contain a crewmemberID that is turned into numbers 
*/
async function repair(crewMemberID){
    const currentPath = '/crew/' + crewMemberID + '/tasks/' + 'repair'
    const response = await fetch(currentPath, {method: 'GET'})

    var currArr = await response.json()


    console.log('currArr = ' + currArr)
    let keysArr = Object.keys(currArr)
    let newArr = []
    for(i = 0; i < keysArr.length; i++){
        var num = currArr[keysArr[i]]
        if(num != 0){   
            if(num < 0){
                num = Math.abs(num)
            }
            num = 1/num
            num = num * num * num
            num = num % 360
        }
        newArr.push(num)
    }
    await postWithData(currentPath, newArr)
}

async function runScript() {
    const REPAIR_CODE = 500
    const OK_CODE = 200
    const COMPLETED_CODE = 204
    const T_1 = 'cleaning1'
    const T_2 = 'cleaning2'
    const T_3 = 'decoding'

    const crewMemberID = await getCrewMemberID()
    console.log("> crew member id: " + crewMemberID)
    var isComplete = false

    while(!isComplete) {
        var getNextTaskPromise = await getNextTask(crewMemberID)
        var currentStatus = getNextTaskPromise.status

        if(currentStatus === COMPLETED_CODE) {
            isComplete = true; 
            console.log("> game won! all tasks completed")
        } else if(currentStatus === OK_CODE){
            var currentTask = await getNextTaskPromise.text()
            console.log("> executing " + currentTask)
            if(currentTask === T_1) {
               await cleaning1(crewMemberID)
            } else if(currentTask === T_2) {
                await cleaning2(crewMemberID)
            } else if(currentTask === T_3) {
                await decoding(crewMemberID)
            }
        } else if(currentStatus === REPAIR_CODE) {
            console.log("> executing repair")
            await repair(crewMemberID)
        } 
    }
}

registerButtonCallBacks()