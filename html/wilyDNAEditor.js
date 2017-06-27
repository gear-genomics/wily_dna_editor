"use strict";

// Copyright (c) 2017
// Andreas Untergasser. All rights reserved.
// 
//     This file is part of the the Wily DNA Editor suite and libraries.
// 
//     The the Wily DNA Editor suite and libraries are free software;
//     you can redistribute them and/or modify them under the terms
//     of the GNU General Public License as published by the Free
//     Software Foundation; either version 2 of the License, or (at
//     your option) any later version.
// 
//     This software is distributed in the hope that it will be useful,
//     but WITHOUT ANY WARRANTY; without even the implied warranty of
//     MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
//     GNU General Public License for more details.
// 
//     You should have received a copy of the GNU General Public License
//     along with this software (file gpl-2.0.txt in the source
//     distribution); if not, write to the Free Software
//     Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA 02110-1301 USA
// 
// THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
// "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
// LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
// A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
// OWNERS OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
// SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
// LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
// DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
// THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
// (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
// OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

// Global Variables
var wdeZeroOne = 1;
var wdeNumbers = 1;
var wdeCircular = 1;
var wdeREdisp = 0;
var wdeREvalid = 0;
var wdeDamDcmSel = 1;
var wdeEnzy=[];
// [0] = name
// [1] = sequence
// [2] = Selected
// [3] = Number of occurences in sequence
// [4] = Positions
// [5] = Dam/Dcm:
//       N = no Dam/Dcm
//       A = Dam
//       C = Dcm
//       D = Dam and Dcm
var wdeSeqHigh=[];


function wdeActivateIframe(){
    window.frames['WDE_RTF'].document.designMode = 'On';
    var fileLoad = document.getElementById("WDE_Load_File");
    fileLoad.addEventListener("change", wdeLoadFile, false);
    window.frames['WDE_RTF'].document.addEventListener('cut', wdeCutEvent);
    window.frames['WDE_RTF'].document.addEventListener('copy', wdeCopyEvent);
    window.frames['WDE_RTF'].document.addEventListener('paste', wdePasteEvent);
    var box = document.getElementById("WDE_DAM_DCM");
    box.checked = true;
    wdePopulateEnzmes();
    wdeDrawEnzymes();
}

function wdeRepaint(){
    window.frames['WDE_RTF'].document.body.innerHTML = wdeFormatSeq(wdeCleanSeq(window.frames['WDE_RTF'].document.body.innerHTML), wdeZeroOne, wdeNumbers);
}

function wdePasteEvent (e) {
    wdeREvalid = 0;
    setTimeout(function (){
        wdeRepaint();
    }, 0);  
}

function wdeCopyEvent (e) {
    e.stopPropagation();
    e.preventDefault();
    var selection = wdeCleanSeq(window.frames['WDE_RTF'].getSelection().toString());
    e.clipboardData.setData('text/plain', selection);
}

function wdeCutEvent (e) {
    e.stopPropagation();
    e.preventDefault();
    wdeREvalid = 0;
    var sel = window.frames['WDE_RTF'].getSelection();
    var selection = wdeCleanSeq(sel.toString());
    e.clipboardData.setData('text/plain', selection);
    sel.deleteFromDocument();
    wdeRepaint();
}

function wdeSendP3P(){
    mainForm.elements["SEQUENCE_TEMPLATE"].value = wdeCleanSeq(window.frames['WDE_RTF'].document.body.innerHTML);
    mainForm.submit();
}


function test() {
    alert("hallo");
}

function wdeViewZeroOne(){
    var lButton = document.getElementById("cmdZeroOneButton");
    if (wdeZeroOne) {
        wdeZeroOne = 0;
        lButton.value = "0";
    } else {
        wdeZeroOne = 1;
        lButton.value = "1";
    }
    wdeRepaint();
}

function wdeViewNumbers(){
    if (wdeNumbers) {
        wdeNumbers = 0;
    } else {
        wdeNumbers = 1;
    }
    wdeRepaint();
}

function wdeHighlight(){
    // Set Highlights to nothing
    var seq = wdeCleanSeq(window.frames['WDE_RTF'].document.body.innerHTML);
    var end = seq.length;
    for (var j = 0; j < end ; j++) {
        wdeSeqHigh[j] = ".";
    }
    if (wdeREdisp) {
        wdeREdisp = 0;
    } else {
        var sel = 0;
        // Place the Masking
        for (var k = 0; k < wdeEnzy.length; k++) {
            if (wdeEnzy[k][2]){
                sel++;
                var listArr = wdeEnzy[k][4].split(";");
                for (var i = 1; i < listArr.length; i++) {
                    var posAr = listArr[i].split(",");
                    for (var p = 0; p < parseInt(posAr[1]); p++) {
                        var curr = parseInt(posAr[0]) - wdeZeroOne + p;
                        if (curr < end) {
                            wdeSeqHigh[curr] = "R";
                        }
                    }
                }
            }
        }
        if (sel > 0) {
            if (wdeREvalid) {
                wdeREdisp = 1;
            } else {
                alert("Please find restriction enzymes first/again.");
            }
        } else {
            alert("No restriction enzymes selected!\n\nSelect at least one restriction enzyme.");
        }
    }
    wdeRepaint();
}

function cmdCircularLinear(){
    var lButton = document.getElementById("cmdCircularButton");

    if (wdeCircular) {
        wdeCircular = 0;
        lButton.value = "Linear";
    } else {
        wdeCircular = 1;
        lButton.value = "Circular";
    }
}

function wdeDamDcm() {
    var box = document.getElementById("WDE_DAM_DCM");
    if (wdeDamDcmSel) {
        wdeDamDcmSel = 0;
        box.checked=false;
    } else {
        wdeDamDcmSel = 1;
        box.checked=true;
    }
}

function wdeNewWindow(){
    var win = window.open("index.html", '_blank');
    win.focus();
}

function wdeLoadFile(f){
    var file = f.target.files[0];
    if (file) { // && file.type.match("text/*")) {
        var reader = new FileReader();
        reader.onload = function(event) {
            window.frames['WDE_RTF'].document.body.innerHTML = wdeFormatSeq(wdeCleanSeq(wdeReadFile(event.target.result)), wdeZeroOne, wdeNumbers);
        }
        reader.readAsText(file);
    } else {
        alert("Error opening file");
    }
    
}

function wdeReadFile(seq) {
    var reg = /^>/
    if (reg.exec(seq)) {
        var eoTitel = seq.indexOf("\n");
        var titel = seq.substring(1,eoTitel);
        mainForm.elements["SEQUENCE_ID"].value = titel;
        eoTitel++;
        return seq.substring(eoTitel, seq.length);
        alert(titel);
    }
    return seq; 
}

function wdeSaveFasta() {
    var content = ">";
    content += mainForm.elements["SEQUENCE_ID"].value;
    content += "\n";
    var seq = wdeCleanSeq(window.frames['WDE_RTF'].document.body.innerHTML);
        for (var i = 0; i < seq.length ; i++) {
            if (i % 70 == 0) {
                if (i != 0) {
                    content += "\n";
                }
            }
            content += seq.charAt(i);
        }
    content += "\n";
    var fileName = mainForm.elements["SEQUENCE_ID"].value + ".fa";
    wdeSaveFile(fileName, content);
};

function wdeSaveFile(fileName,content) {
    var MIME_TYPE = "text/plain";
    var a = document.createElement("a");
    document.body.appendChild(a);
    a.style = "display: none";
    var blob = new Blob([content], {type: "text/plain"});
    var url = window.URL.createObjectURL(blob);
    a.href = url;
    a.download = fileName;
    a.click();
    window.URL.revokeObjectURL(url);
};

function wdeModifySelection(modifyFunction){
    var sel, range;
    if (window.frames['WDE_RTF'].getSelection) {
        sel = window.frames['WDE_RTF'].getSelection();
        var theSelection = sel.toString();
        var replacementText = modifyFunction(theSelection);
        if (sel.rangeCount) {
            range = sel.getRangeAt(0);
            range.deleteContents();
            range.insertNode(window.frames['WDE_RTF'].document.createTextNode(replacementText));
        }
    } 
    wdeRepaint();
}

function wdeUpToLow() {
    wdeModifySelection(wdeUpToLowModify);
}

function wdeUpToLowModify(text) {
    return text.toLowerCase();
}

function wdeLowToUp() {
    wdeModifySelection(wdeLowToUpModify);
}

function wdeLowToUpModify(text) {
    return text.toUpperCase();
}

function wdeUpexLow() {
    wdeModifySelection(wdeUpexLowModify);
}

function wdeUpexLowModify(text) {
    var retText = "";
    for (var i = 0; i < text.length ; i++) {
        var letter = text.charAt(i);
        if (letter == letter.toUpperCase()) {
            retText += letter.toLowerCase();
        } else {
            retText += letter.toUpperCase();
        }
    }
    return retText;
}

function wdeCopyPaste() {
    // WDE_RTF.document.execCommand('bold',false,null);
    // WDE_RTF.document.execCommand('copy');
    alert("Due to security policy the Wiley DNA Editor has limited clipboard access.\n\n" +
          "Only keyboard shortcuts are supported:\n\n" +
          "Cut: Ctrl+X or Cmd+X\n" +
          "Copy: Ctrl+C or Cmd+C\n" +
          "Paste: Ctrl+V or Cmd+V\n" +
          "Select All: Ctrl+A or Cmd+A\n\n" +
          "On some keyboards Ctrl is labled Strg\n\n" );
}

function wdeRComp(){
    wdeREvalid = 0;
    window.frames['WDE_RTF'].document.body.innerHTML = wdeFormatSeq(wdeReverseComplement(wdeCleanSeq(window.frames['WDE_RTF'].document.body.innerHTML)), wdeZeroOne, wdeNumbers);
}

function wdeRCompSel() {
    wdeREvalid = 0;
    wdeModifySelection(wdeReverseComplement);
}


function wdeCleanSeq(seq){
    var retSeq = "";
    // Remove all HTML tags
    var regEx1 = /<span style="background-color:red">/g;
    seq = seq.replace(regEx1, " ");
    var regEx2 = /<\/span>/g;
    seq = seq.replace(regEx2, " ");
    var regEx3 = /<pre>/g;
    seq = seq.replace(regEx3, " ");
    var regEx4 = /<\/pre>/g;
    seq = seq.replace(regEx4, " ");

    retSeq = wdeRetAmbiqutyOnly(seq);
    return retSeq;
}


function wdeFormatSeq(seq, wdeZeroOne, wdeNumbers){
    var outSeq = "\n";
    var length = seq.length;
    var digits = 0;
    var lastBaseMark = ".";
    var openMark = "";
    var closeMark = "";
    for (var i = length; i > 1 ; i = i / 10) {
        digits++;
    }
    digits++;
    mainForm.elements["SEQUENCE_LENGTH"].value = length;
    
    for (var i = 0; i < seq.length ; i++) {
        if (i % 80 == 0) {
            if (i != 0) {
                outSeq += "\n";
            }
            if (wdeNumbers != 0) {
                var pIco = i + wdeZeroOne;
                var iStr = pIco.toString();
                for (var j = digits; j > iStr.length ; j--) {
                    outSeq += " ";
                }
                outSeq += iStr + "  ";
            }
        } else {
            if ((i % 10 == 0) && (wdeNumbers != 0)) {
                outSeq += " ";
            }
        }
        // Place the enzyme selection
        if (wdeREdisp && wdeREvalid && (wdeSeqHigh[i] != lastBaseMark)) {
            if (wdeSeqHigh[i] == "R") {
                openMark = '<span style="background-color:red">';
                closeMark = "</span>";
                outSeq += openMark;
            }
            if (wdeSeqHigh[i] == ".") {
                outSeq += closeMark;
                openMark = "";
                closeMark = "";
            }
            lastBaseMark = wdeSeqHigh[i];
        }
        outSeq += seq.charAt(i);    
    }
    return "<pre> " + outSeq + " </pre>";
}

function wdeFindRE() {
    // All sequence has to be lowecase to save the convesion later
    var seqPure = wdeCleanSeq(window.frames['WDE_RTF'].document.body.innerHTML).toLowerCase();
    var seq = seqPure;
    var dam = seqPure;
    // Mask Dam methylation
    var regEx1 = /gatc/g;
    dam = dam.replace(regEx1, "gxxc");
    // Mask Dcm methylation
    var dcm = seqPure;
    var regEx2 = /ccagg/g;
    dcm = dcm.replace(regEx2, "cxaxg");
    var regEx3 = /cctgg/g;
    dcm = dcm.replace(regEx3, "cxtxg");
    // Do Both  
    var damDcm = dcm;
    damDcm = damDcm.replace(regEx1, "gxxc");
    
    var checkRevCompll = 0;
    for (var k = 0; k < wdeEnzy.length; k++) {
        if (wdeDamDcmSel) {
            if (wdeEnzy[k][5] == "N") {
                seq = seqPure;
            }
            if (wdeEnzy[k][5] == "A") {
                seq = dam;
            }
            if (wdeEnzy[k][5] == "C") {
                seq = dcm;
            }
            if (wdeEnzy[k][5] == "D") {
                seq = damDcm;
            }
        }
        
        var restSequence = wdeCleanSeq(wdeEnzy[k][1]); //"AAGCTT";
        var restSeq = restSequence.toLowerCase();
        var isATCGonly = true;
        var reg = /[^ATGCatgc]/
        if (reg.exec(restSeq)) {
            isATCGonly = false;
        }
        var checkRevComp = false;
        var revCompRestSeq = wdeReverseComplement(restSeq);
        if (restSeq !=  revCompRestSeq) {
            checkRevComp = true;
            checkRevCompll++;
        }
        var restLength = restSeq.length;
        var restPos = "";
        var restCount = 0;
        // Get the end right
        var end = seq.length - restLength;
        if (end < 1) {
            end = 1;
        }
        // Test all the words for matches
        for (var i = 0; i <= end ; i++) {
            var word = seq.substr(i, restLength);
            if ((isATCGonly && (word == restSeq)) ||
                (!isATCGonly && wdeIsSameSeq(word,restSeq))){
                restCount++;
                var pos = i + wdeZeroOne;
                restPos += ";" + pos + "," + restLength;
            }
            if ((checkRevComp && isATCGonly && (word == revCompRestSeq)) ||
                (checkRevComp && !isATCGonly && wdeIsSameSeq(word,revCompRestSeq))){
                restCount++;
                var pos = i + wdeZeroOne;
                restPos += ";" + pos + "," + restLength;
            }
        }
        // Test the circular overlap
        if (wdeCircular) {
            for (var i = 1; i < restLength ; i++) {
                var word = seq.substr(end + i, restLength - i) + seq.substr(0, i);
                if ((isATCGonly && (word == restSeq)) ||
                    (!isATCGonly && wdeIsSameSeq(word,restSeq))){
                    restCount++;
                    var pos = end + i + wdeZeroOne;
                    restPos += ";" + pos + "," + restLength;
                }
                if ((checkRevComp && isATCGonly && (word == revCompRestSeq)) ||
                    (checkRevComp && !isATCGonly && wdeIsSameSeq(word,revCompRestSeq))){
                    restCount++;
                    var pos = end + i + wdeZeroOne;
                    restPos += ";" + pos + "," + restLength;
                }
            }
        }
        wdeEnzy[k][3] = restCount;
        wdeEnzy[k][4] = restPos;
    }
    wdeREvalid = 1;
    wdeDrawEnzymes();       
}

function wdeSelEnzymes(checkBox, enzId) {
    if (checkBox.checked) {
        wdeEnzy[enzId][2] = 1;
        
    } else {
        wdeEnzy[enzId][2] = 0;
    }
    wdeDrawEnzymes();
}

function wdeSelREdeselect() {
    for (var k = 0; k < wdeEnzy.length; k++) {
        wdeEnzy[k][2] = 0;
    }
    wdeDrawEnzymes();
}

function wdeSelREselMLE(sel) {
    var rsNr = mainForm.elements["RESTRICTION_NR"].value;
    wdeSelREsel(sel, rsNr);
}

function wdeSelREsel(sel, rsNr) {
    for (var k = 0; k < wdeEnzy.length; k++) {
        if (((sel == "L") && (wdeEnzy[k][3] < rsNr)) ||
            ((sel == "E") && (wdeEnzy[k][3] == rsNr)) ||
            ((sel == "M") && (wdeEnzy[k][3] > rsNr))){
            wdeEnzy[k][2] = 1;          
        }
    }
    wdeDrawEnzymes();
}

function wdeSelREListDS(sel) {
    var rawList = mainForm.elements["RESTRICTION_LIST"].value;
    var regEx = / /g;
    var list = rawList.replace(regEx, "");
    var listArr = list.split(",");
    for (var k = 0; k < wdeEnzy.length; k++) {
        for (var i = 0; i < listArr.length; i++) {
            if ((listArr[i].length > 3) && (wdeEnzy[k][0] == listArr[i])){
                if (sel == "S"){
                    wdeEnzy[k][2] = 1;          
                } else {
                    wdeEnzy[k][2] = 0;  
                }
            }
        }
    }
    wdeDrawEnzymes();
}

function wdeDrawEnzymes() {
    var enzyDoc = document.getElementById("WDE_enzymes_spacer");
    var content = '<table border="0">';
    var row = Math.ceil(wdeEnzy.length / 3);
    content += "<tr>";
    content += "<th>Sel</th>";
    content += "<th>&nbsp;&nbsp;Hits</th>";
    content += "<th>Name</th>";
    content += "<th>Sequence</th>";
    content += "<th>&nbsp;&nbsp;&nbsp;</th>";
    content += "<th>Sel</th>";
    content += "<th>&nbsp;&nbsp;Hits</th>";
    content += "<th>Name</th>";
    content += "<th>Sequence</th>";
    content += "<th>&nbsp;&nbsp;&nbsp;</th>";
    content += "<th>Sel</th>";
    content += "<th>&nbsp;&nbsp;Hits</th>";
    content += "<th>Name</th>";
    content += "<th>Sequence</th>";
    content += "</tr>\n";
    
//  alert(wdeEnzy[1][0] + " - " + wdeEnzy[1][4]);
    
    for (var i = 0; i < row; i++) {
        content += "<tr>";
        var bgRed1 = "";
        var bgRed2 = "";
        var bgRed3 = "";
        var chBx1 = "";
        var chBx2 = "";
        var chBx3 = "";
        if (wdeEnzy[i][2] != 0) {
            bgRed1 = ' bgcolor="red"';
            chBx1 = ' checked=""';
        } 
        if (wdeEnzy[i + row][2] != 0) {
            bgRed2 = ' bgcolor="red"';
            chBx2 = ' checked=""';
        } 
        content += "<td" + bgRed1 + ">" + '<input type="checkbox" id="WDE_' + i;
        content += '" onclick="wdeSelEnzymes(this, ' + i + ')"' + chBx1 + '></td>';
        content += '<td style="text-align:right"' + bgRed1 + ">" + wdeEnzy[i][3] + " &nbsp;</td>";
        content += "<td" + bgRed1 + ">" + wdeEnzy[i][0] + "</td>";
        content += "<td" + bgRed1 + ">&nbsp;" + wdeEnzy[i][1] + "</td>";
        content += "<th>&nbsp;&nbsp;&nbsp;</th>";
        
        content += "<td" + bgRed2 + ">" + '<input type="checkbox" id="WDE_' + (i + row);
        content += '" onclick="wdeSelEnzymes(this, ' + (i + row) + ')"' + chBx2 + '></td>';
        content += '<td style="text-align:right"' + bgRed2 + ">" + wdeEnzy[i + row][3] + " &nbsp;</td>";
        content += "<td" + bgRed2 + ">" + wdeEnzy[i + row][0] + "</td>";
        content += "<td" + bgRed2 + ">&nbsp;" + wdeEnzy[i + row][1] + "</td>";
        content += "<th>&nbsp;&nbsp;&nbsp;</th>";

        if ((i + 2 * row) < wdeEnzy.length) {
            if (wdeEnzy[i + 2 * row][2] != 0) {
                bgRed3 = ' bgcolor="red"';
                chBx3 = ' checked=""';
            } 
            content += "<td" + bgRed3 + ">" + '<input type="checkbox" id="WDE_' + (i + 2 * row);
            content += '" onclick="wdeSelEnzymes(this, ' + (i + 2 * row) + ')"' + chBx3 + '></td>';
            content += '<td style="text-align:right"' + bgRed3 + ">" + wdeEnzy[i + 2 * row][3] + " &nbsp;</td>";
            content += "<td" + bgRed3 + ">" + wdeEnzy[i + 2 * row][0] + "</td>";
            content += "<td" + bgRed3 + ">&nbsp;" + wdeEnzy[i + 2 * row][1] + "</td>";
            content += "</tr>\n";
        } else {
            content += "<td></td><td></td><td></td><td></td>";
            content += "</tr>\n";
        }
    }
    content += "</table>";
    enzyDoc.innerHTML = content;
}


//////////////////////////////////////////////////////////////////////
// Now only the reverse complementation and enzyme functions follow //
//////////////////////////////////////////////////////////////////////

// Sequences have to be of same length
// Seq1 is expected to be ATGC
function wdeIsSameSeq(seq1, seq2){
    if (seq1.length != seq2.length) {
        return false;
    }
    var retval = true;
    for (var i = 0; i < seq1.length ; i++) {
        if ((seq1.charAt(i) != seq2.charAt(i)) &&
            ((seq1.charAt(i) != "n") || 
             (seq1.charAt(i) != "n") )) {
            if (seq1.charAt(i) == "a") {
                    var regEx = /[ctgyskb]/;
                    if (regEx.exec(seq2.charAt(i))) {
                        return false;
                    }
            }
            if (seq1.charAt(i) == "t") {
                    var regEx = /[acgrsmv]/;
                    if (regEx.exec(seq2.charAt(i))) {
                        return false;
                    }
            }
            if (seq1.charAt(i) == "c") {
                    var regEx = /[atgrwkd]/;
                    if (regEx.exec(seq2.charAt(i))) {
                        return false;
                    }
            }
            if (seq1.charAt(i) == "g") {
                    var regEx = /[atcywmh]/;
                    if (regEx.exec(seq2.charAt(i))) {
                        return false;
                    }
            }
            // Mask for Dam/Dcm methylation
            if (seq1.charAt(i) == "x") {
                return false;
            }
            if (seq1.charAt(i) == "r") {
                    var regEx = /[tcy]/;
                    if (regEx.exec(seq2.charAt(i))) {
                        return false;
                    }
            }
            if (seq1.charAt(i) == "y") {
                    var regEx = /[gar]/;
                    if (regEx.exec(seq2.charAt(i))) {
                        return false;
                    }
            }
            if (seq1.charAt(i) == "s") {
                    var regEx = /[atw]/;
                    if (regEx.exec(seq2.charAt(i))) {
                        return false;
                    }
            }
            if (seq1.charAt(i) == "w") {
                    var regEx = /[cgs]/;
                    if (regEx.exec(seq2.charAt(i))) {
                        return false;
                    }
            }
            if (seq1.charAt(i) == "k") {
                    var regEx = /[acm]/;
                    if (regEx.exec(seq2.charAt(i))) {
                        return false;
                    }
            }
            if (seq1.charAt(i) == "m") {
                    var regEx = /[tgk]/;
                    if (regEx.exec(seq2.charAt(i))) {
                        return false;
                    }
            }
            if (seq1.charAt(i) == "b") {
                    if (seq2.charAt(i) == "a") {
                        return false;
                    }
            }
            if (seq1.charAt(i) == "v") {
                    if (seq2.charAt(i) == "t") {
                        return false;
                    }
            }
            if (seq1.charAt(i) == "d") {
                    if (seq2.charAt(i) == "c") {
                        return false;
                    }
            }
            if (seq1.charAt(i) == "h") {
                    if (seq2.charAt(i) == "g") {
                        return false;
                    }
            }
        }
    }
    return retval;
}

// All non ambiguty codes are lost and u->t
function wdeRetAmbiqutyOnly(seq){
    var retSeq = "";
    for (var i = 0; i < seq.length ; i++) {
        switch (seq.charAt(i)) {
            case "a": retSeq += "a";
                break;
            case "A": retSeq += "A";
                break;
            case "c": retSeq += "c";
                break;
            case "C": retSeq += "C";
                break;
            case "g": retSeq += "g";
                break;
            case "G": retSeq += "G";
                break;
            case "t": retSeq += "t";
                break;
            case "T": retSeq += "T";
                break;
            case "n": retSeq += "n";
                break;
            case "N": retSeq += "N";
                break;
            case "u": retSeq += "t";
                break;
            case "U": retSeq += "T";
                break;
            case "r": retSeq += "r";
                break;
            case "R": retSeq += "R";
                break;
            case "y": retSeq += "y";
                break;
            case "Y": retSeq += "Y";
                break;
            case "m": retSeq += "m";
                break;
            case "M": retSeq += "M";
                break;
            case "k": retSeq += "k";
                break;
            case "K": retSeq += "K";
                break;
            case "s": retSeq += "s";
                break;
            case "S": retSeq += "S";
                break;
            case "w": retSeq += "w";
                break;
            case "W": retSeq += "W";
                break;
            case "b": retSeq += "b";
                break;
            case "B": retSeq += "B";
                break;
            case "d": retSeq += "d";
                break;
            case "D": retSeq += "D";
                break;
            case "h": retSeq += "h";
                break;
            case "H": retSeq += "H";
                break;
            case "v": retSeq += "v";
                break;
            case "V": retSeq += "V";
                break;
        }               
    }
    return retSeq;
}

function wdeReverseComplement(seq){
    var revComp = "";
    for (var i = seq.length; i >= 0 ; i--) {
        switch (seq.charAt(i)) {
            case "a": revComp += "t";
                break;
            case "A": revComp += "T";
                break;
            case "c": revComp += "g";
                break;
            case "C": revComp += "G";
                break;
            case "g": revComp += "c";
                break;
            case "G": revComp += "C";
                break;
            case "t": revComp += "a";
                break;
            case "T": revComp += "A";
                break;
            case "n": revComp += "n";
                break;
            case "N": revComp += "N";
                break;
            case "u": revComp += "a";
                break;
            case "U": revComp += "A";
                break;
            case "r": revComp += "y";
                break;
            case "R": revComp += "Y";
                break;
            case "y": revComp += "r";
                break;
            case "Y": revComp += "R";
                break;
            case "s": revComp += "s";
                break;
            case "S": revComp += "S";
                break;
            case "w": revComp += "w";
                break;
            case "W": revComp += "W";
                break;
            case "k": revComp += "m";
                break;
            case "K": revComp += "M";
                break;
            case "m": revComp += "k";
                break;
            case "M": revComp += "K";
                break;
            case "b": revComp += "v";
                break;
            case "B": revComp += "V";
                break;
            case "v": revComp += "b";
                break;
            case "V": revComp += "B";
                break;
            case "d": revComp += "h";
                break;
            case "D": revComp += "H";
                break;
            case "h": revComp += "d";
                break;
            case "H": revComp += "D";
                break;
        }
    }
    return revComp;
}

function wdeSetDamDcmMeth() {
    var dam = ["AlwI","BcgI","BclI","BsaBI","BspDI","BspEI",
               "BspHI","ClaI","DpnII","EciI","HphI","Hpy188I",
               "Hpy188III","MboI","MboII","NdeII","NruI","TaqI",
               "XbaI"];
    var dcm = ["Acc65I","AlwNI","ApaI","Asp718I","AvaII","BsaI",
               "EaeI","MscI","NlaIV","PflMI","PpuMI","PspGI","PspOMI",
               "Sau96I","ScrFI","SexAI","StuI","StyD4I"];
    var isDam;
    var isDcm;
    for (var k = 0; k < wdeEnzy.length; k++) {
        isDam = false;
        isDcm = false;
        for (var i = 0; i < dam.length; i++) {
            if (dam[i] == wdeEnzy[k][0]){
                isDam = true;
            }
        }
        for (var i = 0; i < dcm.length; i++) {
            if (dcm[i] == wdeEnzy[k][0]){
                isDcm = true;
            }
        }
        if(!isDam && !isDcm) {
            wdeEnzy[k][5] = "N";
        }
        if(isDam && !isDcm) {
            wdeEnzy[k][5] = "A";
        }
        if(!isDam && isDcm) {
            wdeEnzy[k][5] = "C";
        }
        if(isDam && isDcm) {
            wdeEnzy[k][5] = "D";
        }   
    }
    // [5] = Dam/Dcm:
    //       N = no Dam/Dcm
    //       A = Dam
    //       C = Dcm
    //       D = Dam and Dcm    
}

// Populate the Enzymes array
// This function is created by the perl script from rebase data
// See:
// Roberts, R.J., Vincze, T., Posfai, J., Macelis, D.
// REBASE-a database for DNA restriction and modification: enzymes, genes and genomes.
// Nucleic Acids Res. 43: D298-D299 (2015).
// doi: 10.1093/nar/gku1046
//
// Do not modify!!!!
function wdePopulateEnzmes() {
    wdeEnzy[0]=["AatII","GACGT^C",0,0,""];
    wdeEnzy[1]=["AccI","GT^MKAC",0,0,""];
    wdeEnzy[2]=["Acc65I","G^GTACC",0,0,""];
    wdeEnzy[3]=["AciI","CCGC(-3/-1)",0,0,""];
    wdeEnzy[4]=["AclI","AA^CGTT",0,0,""];
    wdeEnzy[5]=["AcuI","CTGAAG(16/14)",0,0,""];
    wdeEnzy[6]=["AfeI","AGC^GCT",0,0,""];
    wdeEnzy[7]=["AflII","C^TTAAG",0,0,""];
    wdeEnzy[8]=["AflIII","A^CRYGT",0,0,""];
    wdeEnzy[9]=["AgeI","A^CCGGT",0,0,""];
    wdeEnzy[10]=["AhdI","GACNNN^NNGTC",0,0,""];
    wdeEnzy[11]=["AleI","CACNN^NNGTG",0,0,""];
    wdeEnzy[12]=["AluI","AG^CT",0,0,""];
    wdeEnzy[13]=["AlwI","GGATC(4/5)",0,0,""];
    wdeEnzy[14]=["AlwNI","CAGNNN^CTG",0,0,""];
    wdeEnzy[15]=["ApaI","GGGCC^C",0,0,""];
    wdeEnzy[16]=["ApaLI","G^TGCAC",0,0,""];
    wdeEnzy[17]=["ApeKI","G^CWGC",0,0,""];
    wdeEnzy[18]=["ApoI","R^AATTY",0,0,""];
    wdeEnzy[19]=["AscI","GG^CGCGCC",0,0,""];
    wdeEnzy[20]=["AseI","AT^TAAT",0,0,""];
    wdeEnzy[21]=["AsiSI","GCGAT^CGC",0,0,""];
    wdeEnzy[22]=["Asp700I","GAANN^NNTTC",0,0,""];
    wdeEnzy[23]=["Asp718I","G^GTACC",0,0,""];
    wdeEnzy[24]=["AvaI","C^YCGRG",0,0,""];
    wdeEnzy[25]=["AvaII","G^GWCC",0,0,""];
    wdeEnzy[26]=["AvrII","C^CTAGG",0,0,""];
    wdeEnzy[27]=["BaeGI","GKGCM^C",0,0,""];
    wdeEnzy[28]=["BamHI","G^GATCC",0,0,""];
    wdeEnzy[29]=["BanI","G^GYRCC",0,0,""];
    wdeEnzy[30]=["BanII","GRGCY^C",0,0,""];
    wdeEnzy[31]=["BbrPI","CAC^GTG",0,0,""];
    wdeEnzy[32]=["BbsI","GAAGAC(2/6)",0,0,""];
    wdeEnzy[33]=["BbvI","GCAGC(8/12)",0,0,""];
    wdeEnzy[34]=["BbvCI","CCTCAGC(-5/-2)",0,0,""];
    wdeEnzy[35]=["BccI","CCATC(4/5)",0,0,""];
    wdeEnzy[36]=["BceAI","ACGGC(12/14)",0,0,""];
    wdeEnzy[37]=["BciVI","GTATCC(6/5)",0,0,""];
    wdeEnzy[38]=["BclI","T^GATCA",0,0,""];
    wdeEnzy[39]=["BcoDI","GTCTC(1/5)",0,0,""];
    wdeEnzy[40]=["BfaI","C^TAG",0,0,""];
    wdeEnzy[41]=["BfrI","C^TTAAG",0,0,""];
    wdeEnzy[42]=["BfuAI","ACCTGC(4/8)",0,0,""];
    wdeEnzy[43]=["BfuCI","^GATC",0,0,""];
    wdeEnzy[44]=["BglI","GCCNNNN^NGGC",0,0,""];
    wdeEnzy[45]=["BglII","A^GATCT",0,0,""];
    wdeEnzy[46]=["BlnI","C^CTAGG",0,0,""];
    wdeEnzy[47]=["BlpI","GC^TNAGC",0,0,""];
    wdeEnzy[48]=["BmgBI","CACGTC(-3/-3)",0,0,""];
    wdeEnzy[49]=["BmrI","ACTGGG(5/4)",0,0,""];
    wdeEnzy[50]=["BmtI","GCTAG^C",0,0,""];
    wdeEnzy[51]=["BpmI","CTGGAG(16/14)",0,0,""];
    wdeEnzy[52]=["Bpu10I","CCTNAGC(-5/-2)",0,0,""];
    wdeEnzy[53]=["BpuEI","CTTGAG(16/14)",0,0,""];
    wdeEnzy[54]=["BsaI","GGTCTC(1/5)",0,0,""];
    wdeEnzy[55]=["BsaAI","YAC^GTR",0,0,""];
    wdeEnzy[56]=["BsaBI","GATNN^NNATC",0,0,""];
    wdeEnzy[57]=["BsaHI","GR^CGYC",0,0,""];
    wdeEnzy[58]=["BsaJI","C^CNNGG",0,0,""];
    wdeEnzy[59]=["BsaWI","W^CCGGW",0,0,""];
    wdeEnzy[60]=["BsaXI","(9/12)ACNNNNNCTCC(10/7)",0,0,""];
    wdeEnzy[61]=["BseRI","GAGGAG(10/8)",0,0,""];
    wdeEnzy[62]=["BseYI","CCCAGC(-5/-1)",0,0,""];
    wdeEnzy[63]=["BsgI","GTGCAG(16/14)",0,0,""];
    wdeEnzy[64]=["BsiEI","CGRY^CG",0,0,""];
    wdeEnzy[65]=["BsiHKAI","GWGCW^C",0,0,""];
    wdeEnzy[66]=["BsiWI","C^GTACG",0,0,""];
    wdeEnzy[67]=["BslI","CCNNNNN^NNGG",0,0,""];
    wdeEnzy[68]=["BsmI","GAATGC(1/-1)",0,0,""];
    wdeEnzy[69]=["BsmAI","GTCTC(1/5)",0,0,""];
    wdeEnzy[70]=["BsmBI","CGTCTC(1/5)",0,0,""];
    wdeEnzy[71]=["BsmFI","GGGAC(10/14)",0,0,""];
    wdeEnzy[72]=["BsoBI","C^YCGRG",0,0,""];
    wdeEnzy[73]=["Bsp1286I","GDGCH^C",0,0,""];
    wdeEnzy[74]=["BspCNI","CTCAG(9/7)",0,0,""];
    wdeEnzy[75]=["BspDI","AT^CGAT",0,0,""];
    wdeEnzy[76]=["BspEI","T^CCGGA",0,0,""];
    wdeEnzy[77]=["BspHI","T^CATGA",0,0,""];
    wdeEnzy[78]=["BspMI","ACCTGC(4/8)",0,0,""];
    wdeEnzy[79]=["BspQI","GCTCTTC(1/4)",0,0,""];
    wdeEnzy[80]=["BsrI","ACTGG(1/-1)",0,0,""];
    wdeEnzy[81]=["BsrBI","CCGCTC(-3/-3)",0,0,""];
    wdeEnzy[82]=["BsrDI","GCAATG(2/0)",0,0,""];
    wdeEnzy[83]=["BsrFI","R^CCGGY",0,0,""];
    wdeEnzy[84]=["BsrGI","T^GTACA",0,0,""];
    wdeEnzy[85]=["BssHII","G^CGCGC",0,0,""];
    wdeEnzy[86]=["BssSI","CACGAG(-5/-1)",0,0,""];
    wdeEnzy[87]=["BstAPI","GCANNNN^NTGC",0,0,""];
    wdeEnzy[88]=["BstBI","TT^CGAA",0,0,""];
    wdeEnzy[89]=["BstEII","G^GTNACC",0,0,""];
    wdeEnzy[90]=["BstNI","CC^WGG",0,0,""];
    wdeEnzy[91]=["BstUI","CG^CG",0,0,""];
    wdeEnzy[92]=["BstXI","CCANNNNN^NTGG",0,0,""];
    wdeEnzy[93]=["BstYI","R^GATCY",0,0,""];
    wdeEnzy[94]=["BstZ17I","GTA^TAC",0,0,""];
    wdeEnzy[95]=["Bsu36I","CC^TNAGG",0,0,""];
    wdeEnzy[96]=["BtgI","C^CRYGG",0,0,""];
    wdeEnzy[97]=["BtgZI","GCGATG(10/14)",0,0,""];
    wdeEnzy[98]=["BtsI","GCAGTG(2/0)",0,0,""];
    wdeEnzy[99]=["BtsIMutI","CAGTG(2/0)",0,0,""];
    wdeEnzy[100]=["BtsCI","GGATG(2/0)",0,0,""];
    wdeEnzy[101]=["Cac8I","GCN^NGC",0,0,""];
    wdeEnzy[102]=["CfoI","GCG^C",0,0,""];
    wdeEnzy[103]=["ClaI","AT^CGAT",0,0,""];
    wdeEnzy[104]=["CviAII","C^ATG",0,0,""];
    wdeEnzy[105]=["CviQI","G^TAC",0,0,""];
    wdeEnzy[106]=["DdeI","C^TNAG",0,0,""];
    wdeEnzy[107]=["DpnI","GA^TC",0,0,""];
    wdeEnzy[108]=["DpnII","^GATC",0,0,""];
    wdeEnzy[109]=["DraI","TTT^AAA",0,0,""];
    wdeEnzy[110]=["DraIII","CACNNN^GTG",0,0,""];
    wdeEnzy[111]=["DrdI","GACNNNN^NNGTC",0,0,""];
    wdeEnzy[112]=["EaeI","Y^GGCCR",0,0,""];
    wdeEnzy[113]=["EagI","C^GGCCG",0,0,""];
    wdeEnzy[114]=["EarI","CTCTTC(1/4)",0,0,""];
    wdeEnzy[115]=["EciI","GGCGGA(11/9)",0,0,""];
    wdeEnzy[116]=["Eco47III","AGC^GCT",0,0,""];
    wdeEnzy[117]=["EcoNI","CCTNN^NNNAGG",0,0,""];
    wdeEnzy[118]=["EcoO109I","RG^GNCCY",0,0,""];
    wdeEnzy[119]=["EcoP15I","CAGCAG(25/27)",0,0,""];
    wdeEnzy[120]=["EcoRI","G^AATTC",0,0,""];
    wdeEnzy[121]=["EcoRV","GAT^ATC",0,0,""];
    wdeEnzy[122]=["Eco53kI","GAG^CTC",0,0,""];
    wdeEnzy[123]=["FatI","^CATG",0,0,""];
    wdeEnzy[124]=["FauI","CCCGC(4/6)",0,0,""];
    wdeEnzy[125]=["Fnu4HI","GC^NGC",0,0,""];
    wdeEnzy[126]=["FokI","GGATG(9/13)",0,0,""];
    wdeEnzy[127]=["FseI","GGCCGG^CC",0,0,""];
    wdeEnzy[128]=["FspI","TGC^GCA",0,0,""];
    wdeEnzy[129]=["HaeII","RGCGC^Y",0,0,""];
    wdeEnzy[130]=["HaeIII","GG^CC",0,0,""];
    wdeEnzy[131]=["HgaI","GACGC(5/10)",0,0,""];
    wdeEnzy[132]=["HhaI","GCG^C",0,0,""];
    wdeEnzy[133]=["HinP1I","G^CGC",0,0,""];
    wdeEnzy[134]=["HincII","GTY^RAC",0,0,""];
    wdeEnzy[135]=["HindII","GTY^RAC",0,0,""];
    wdeEnzy[136]=["HindIII","A^AGCTT",0,0,""];
    wdeEnzy[137]=["HinfI","G^ANTC",0,0,""];
    wdeEnzy[138]=["HpaI","GTT^AAC",0,0,""];
    wdeEnzy[139]=["HpaII","C^CGG",0,0,""];
    wdeEnzy[140]=["HphI","GGTGA(8/7)",0,0,""];
    wdeEnzy[141]=["Hpy99I","CGWCG^",0,0,""];
    wdeEnzy[142]=["Hpy166II","GTN^NAC",0,0,""];
    wdeEnzy[143]=["Hpy188I","TCN^GA",0,0,""];
    wdeEnzy[144]=["Hpy188III","TC^NNGA",0,0,""];
    wdeEnzy[145]=["HpyAV","CCTTC(6/5)",0,0,""];
    wdeEnzy[146]=["HpyCH4III","ACN^GT",0,0,""];
    wdeEnzy[147]=["HpyCH4IV","A^CGT",0,0,""];
    wdeEnzy[148]=["HpyCH4V","TG^CA",0,0,""];
    wdeEnzy[149]=["KasI","G^GCGCC",0,0,""];
    wdeEnzy[150]=["KpnI","GGTAC^C",0,0,""];
    wdeEnzy[151]=["KspI","CCGC^GG",0,0,""];
    wdeEnzy[152]=["MaeI","C^TAG",0,0,""];
    wdeEnzy[153]=["MaeII","A^CGT",0,0,""];
    wdeEnzy[154]=["MaeIII","^GTNAC",0,0,""];
    wdeEnzy[155]=["MboI","^GATC",0,0,""];
    wdeEnzy[156]=["MboII","GAAGA(8/7)",0,0,""];
    wdeEnzy[157]=["MfeI","C^AATTG",0,0,""];
    wdeEnzy[158]=["MluI","A^CGCGT",0,0,""];
    wdeEnzy[159]=["MluCI","^AATT",0,0,""];
    wdeEnzy[160]=["MluNI","TGG^CCA",0,0,""];
    wdeEnzy[161]=["MlyI","GAGTC(5/5)",0,0,""];
    wdeEnzy[162]=["MmeI","TCCRAC(20/18)",0,0,""];
    wdeEnzy[163]=["MnlI","CCTC(7/6)",0,0,""];
    wdeEnzy[164]=["MroI","T^CCGGA",0,0,""];
    wdeEnzy[165]=["MscI","TGG^CCA",0,0,""];
    wdeEnzy[166]=["MseI","T^TAA",0,0,""];
    wdeEnzy[167]=["MslI","CAYNN^NNRTG",0,0,""];
    wdeEnzy[168]=["MspI","C^CGG",0,0,""];
    wdeEnzy[169]=["MspA1I","CMG^CKG",0,0,""];
    wdeEnzy[170]=["MunI","C^AATTG",0,0,""];
    wdeEnzy[171]=["MvaI","CC^WGG",0,0,""];
    wdeEnzy[172]=["MvnI","CG^CG",0,0,""];
    wdeEnzy[173]=["MwoI","GCNNNNN^NNGC",0,0,""];
    wdeEnzy[174]=["NaeI","GCC^GGC",0,0,""];
    wdeEnzy[175]=["NarI","GG^CGCC",0,0,""];
    wdeEnzy[176]=["NciI","CC^SGG",0,0,""];
    wdeEnzy[177]=["NcoI","C^CATGG",0,0,""];
    wdeEnzy[178]=["NdeI","CA^TATG",0,0,""];
    wdeEnzy[179]=["NdeII","^GATC",0,0,""];
    wdeEnzy[180]=["NgoMIV","G^CCGGC",0,0,""];
    wdeEnzy[181]=["NheI","G^CTAGC",0,0,""];
    wdeEnzy[182]=["NlaIII","CATG^",0,0,""];
    wdeEnzy[183]=["NlaIV","GGN^NCC",0,0,""];
    wdeEnzy[184]=["NmeAIII","GCCGAG(21/19)",0,0,""];
    wdeEnzy[185]=["NotI","GC^GGCCGC",0,0,""];
    wdeEnzy[186]=["NruI","TCG^CGA",0,0,""];
    wdeEnzy[187]=["NsiI","ATGCA^T",0,0,""];
    wdeEnzy[188]=["NspI","RCATG^Y",0,0,""];
    wdeEnzy[189]=["PacI","TTAAT^TAA",0,0,""];
    wdeEnzy[190]=["PaeR7I","C^TCGAG",0,0,""];
    wdeEnzy[191]=["PciI","A^CATGT",0,0,""];
    wdeEnzy[192]=["PflFI","GACN^NNGTC",0,0,""];
    wdeEnzy[193]=["PflMI","CCANNNN^NTGG",0,0,""];
    wdeEnzy[194]=["PleI","GAGTC(4/5)",0,0,""];
    wdeEnzy[195]=["PluTI","GGCGC^C",0,0,""];
    wdeEnzy[196]=["PmeI","GTTT^AAAC",0,0,""];
    wdeEnzy[197]=["PmlI","CAC^GTG",0,0,""];
    wdeEnzy[198]=["PpuMI","RG^GWCCY",0,0,""];
    wdeEnzy[199]=["PshAI","GACNN^NNGTC",0,0,""];
    wdeEnzy[200]=["PsiI","TTA^TAA",0,0,""];
    wdeEnzy[201]=["PspGI","^CCWGG",0,0,""];
    wdeEnzy[202]=["PspOMI","G^GGCCC",0,0,""];
    wdeEnzy[203]=["PspXI","VC^TCGAGB",0,0,""];
    wdeEnzy[204]=["PstI","CTGCA^G",0,0,""];
    wdeEnzy[205]=["PvuI","CGAT^CG",0,0,""];
    wdeEnzy[206]=["PvuII","CAG^CTG",0,0,""];
    wdeEnzy[207]=["RsaI","GT^AC",0,0,""];
    wdeEnzy[208]=["RsrII","CG^GWCCG",0,0,""];
    wdeEnzy[209]=["SacI","GAGCT^C",0,0,""];
    wdeEnzy[210]=["SacII","CCGC^GG",0,0,""];
    wdeEnzy[211]=["SalI","G^TCGAC",0,0,""];
    wdeEnzy[212]=["SapI","GCTCTTC(1/4)",0,0,""];
    wdeEnzy[213]=["Sau96I","G^GNCC",0,0,""];
    wdeEnzy[214]=["Sau3AI","^GATC",0,0,""];
    wdeEnzy[215]=["SbfI","CCTGCA^GG",0,0,""];
    wdeEnzy[216]=["ScaI","AGT^ACT",0,0,""];
    wdeEnzy[217]=["ScrFI","CC^NGG",0,0,""];
    wdeEnzy[218]=["SexAI","A^CCWGGT",0,0,""];
    wdeEnzy[219]=["SfaNI","GCATC(5/9)",0,0,""];
    wdeEnzy[220]=["SfcI","C^TRYAG",0,0,""];
    wdeEnzy[221]=["SfoI","GGC^GCC",0,0,""];
    wdeEnzy[222]=["SfuI","TT^CGAA",0,0,""];
    wdeEnzy[223]=["SgrAI","CR^CCGGYG",0,0,""];
    wdeEnzy[224]=["SmaI","CCC^GGG",0,0,""];
    wdeEnzy[225]=["SmlI","C^TYRAG",0,0,""];
    wdeEnzy[226]=["SnaBI","TAC^GTA",0,0,""];
    wdeEnzy[227]=["SpeI","A^CTAGT",0,0,""];
    wdeEnzy[228]=["SphI","GCATG^C",0,0,""];
    wdeEnzy[229]=["SrfI","GCCC^GGGC",0,0,""];
    wdeEnzy[230]=["SspI","AAT^ATT",0,0,""];
    wdeEnzy[231]=["StuI","AGG^CCT",0,0,""];
    wdeEnzy[232]=["StyI","C^CWWGG",0,0,""];
    wdeEnzy[233]=["StyD4I","^CCNGG",0,0,""];
    wdeEnzy[234]=["SwaI","ATTT^AAAT",0,0,""];
    wdeEnzy[235]=["TaqI","T^CGA",0,0,""];
    wdeEnzy[236]=["TfiI","G^AWTC",0,0,""];
    wdeEnzy[237]=["Tru9I","T^TAA",0,0,""];
    wdeEnzy[238]=["TseI","G^CWGC",0,0,""];
    wdeEnzy[239]=["Tsp45I","^GTSAC",0,0,""];
    wdeEnzy[240]=["TspMI","C^CCGGG",0,0,""];
    wdeEnzy[241]=["TspRI","CASTGNN^",0,0,""];
    wdeEnzy[242]=["Tth111I","GACN^NNGTC",0,0,""];
    wdeEnzy[243]=["XbaI","T^CTAGA",0,0,""];
    wdeEnzy[244]=["XhoI","C^TCGAG",0,0,""];
    wdeEnzy[245]=["XmaI","C^CCGGG",0,0,""];
    wdeEnzy[246]=["XmnI","GAANN^NNTTC",0,0,""];
    wdeEnzy[247]=["ZraI","GAC^GTC",0,0,""];
    wdeSetDamDcmMeth();
}
