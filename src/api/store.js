
function setCred(cred){
    localStorage.setItem('cred', JSON.stringify(cred));
}

function clearCred() {
    localStorage.removeItem('cred');
}

function getCred() {
    const str = localStorage.getItem('cred');
    return str ? JSON.parse(str) : null;
}

export const credApi = {setCred, getCred, clearCred};