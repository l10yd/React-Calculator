import React, { useState } from 'react';
import './App.css';

export default function App() {
  const [result, setResult] = useState("0"); //хранит только текущее число или оператор
  const [midInput, setMidInput] = useState("0"); //история ввода
  const [mathBlock, setMathBlock] = useState(true); //блокирует мат. операторы (не может быть 2 подряд)
  const [dotBlock, setDotBlock] = useState(false); //блокирует точку (одна в числе)
  const [tempSum, setTempSum] = useState("0"); //хранит вычисление после "=" для дальнейших операций с ним

  //эти кнопки будут мапиться в рендере по очереди, с присвоением value и id
  const buttons = [
    "AC", "CE", "+", "7", "8", "9", "-", "4", "5", "6", "*", "1", "2", "3", "/", "0", ".", "="
  ];

  //вспомогательная функция для CE, возвращает в result только число или только оператор
  const processMidInput = (midInput, operators) => {
    let result = '';
    //с конца проверяет, есть ли в midInput операторы
    for (let i = midInput.length - 1; i >= 0; i--) {
      //если есть, отрезает последнее после оператора число
      if (operators.includes(midInput[i])) {
        result = midInput.substring(i + 1);
        //если строка оканчивается на оператор ("555+555+"), запускает рекурсию,
        //чтобы вернуть только последнее число, а не все выражение целиком
        if (operators.includes(result)) {
          result = midInput.slice(0,-1) + " ";
          return processMidInput(result, operators);
        }  
        //удаляет последний символ из числа и возвращает его
        //выполняется, если к этому моменту result = "число"
        return result = result.length===1 ? midInput[i] : result.slice(0,-1);
      }
    }
    //если изначально midInput содержал только цифры
    return midInput.slice(0,-1);
  }

  //вспомогательная функция, возвращает строку с недостающими закрывающими скобками
  //нужна для случаев, когда несколько раз жали по 2 минуса подряд
  const findMissingBrackets = (input) => {
    let openBracketCount = 0;
    let missingBrackets = '';
    for (let i = 0; i < input.length; i++) {
      if (input[i] === '(') {
        openBracketCount++;
      } else if (input[i] === ')') {
        if (openBracketCount > 0) {
          openBracketCount--;
        } else {
          missingBrackets += ')';
        }
      }
    }
    missingBrackets += ')'.repeat(openBracketCount);
    return missingBrackets;
  }
  
  //основная функция, обрабатывает нажатие на любые кнопки
  const handleClick = (entry) => {   
    //вспомогательная для операторов
    const operators = "+-*/";
    console.log(findMissingBrackets("((()"));
    
    //перезагрузка после "=", сохраняет текущий результат для последующих операций
    if (tempSum!=="0") {      
      //а почему бы не поделить на 0
      if(tempSum.includes("Infinity")) {
        //иначе после деления на бесконечность багается ввод цифр (01, 02 и тд)
        const temp = operators.includes(entry) ? "0" : "";
        setMidInput(temp);
        setResult(temp);
      }
      else {
        //дефолтная ситуация, сохраняет текущий результат
        setMidInput(tempSum);
        setResult(tempSum);     
      }
      setTempSum("0");
    }
    
    //логика для удаления последнего символа из midInput и Result
    if (entry === "CE") {
      //много символов в поле ввода - обнуление
      if (midInput === "Dude stahp") {
        setMidInput("0");
      } else {
        const lastChar = midInput.charAt(midInput.length - 1);
        //если последний символ - точка, можно ставить ее опять, снимаем блок
        //(т.к. в числе может быть только 1 точка)
        if(lastChar === ".") {
          setDotBlock(false);          
        }
        //если же это оператор, можно выбрать другой 
        if (operators.includes(lastChar)) {
          setMathBlock(false);
        }
        //удаляем точку 
        setMidInput((prevMidInput) => prevMidInput.slice(0, -1));
      }
      //если все удалили, то 0
      if (midInput === "" || midInput.length == 1) {
        setMidInput("0");
        setResult("0");
        setMathBlock(false);
      }
      else {
        //вспомогательная функция
        setResult(processMidInput(midInput, operators));
      }

      //полный сброс всего
    } else if (entry === "AC") {
      setResult("0");
      setMidInput("0");
      setTempSum("0");
      setDotBlock(false);
      setMathBlock(false);

      //логика для точки
    } else if (entry === ".") {
      //только если в числе еще нет точки
      if (!dotBlock) {
        //если первый символ, то добавляем 0 перед точкой
        if (midInput === "0" || midInput === "Dude stahp") {
          setResult("0.");
          setMidInput("0.");
        } else {
          const lastChar = midInput.charAt(midInput.length - 1);
          //если последний символ не цифра, добавляем 0 перед точкой
          const tempZero = isNaN(parseInt(lastChar, 10)) ? "0" : "";
          //если добавили 0, то в result начинаем выводить сразу новое число (0.)
          //это нужно, если после оператора жмем точку. чтобы result отображался корректно
          if(tempZero==="0") {
            setResult(tempZero + entry);            
          }
            //иначе добавляем точку к текущему
          else {
            setResult((prevResult) => prevResult + tempZero + entry);
          }
          setMidInput((prevMidInput) => prevMidInput + tempZero + entry);          
        }
        //после точки можно поставить только цифру
        setDotBlock(true);
        setMathBlock(true);
      }
    }
      //вычисление результата и его сохранение в tempSum
    else if (entry === "=") {
      if (!mathBlock) {
        const finalInput = midInput;
        //закрываем скобки после 2х минусов подряд, если они были
        const brackets = findMissingBrackets(finalInput);        
        //строку через eval, потом обрезаем 2 символа после точки, обратно в float и в строку
        const sum = parseFloat(eval(finalInput + brackets).toFixed(3)).toString();      
        setResult(sum);
        setMidInput((prevMidInput) => prevMidInput + brackets + entry + sum);
        setTempSum(sum);
        //можно только 1 точку в числе
        if(sum.includes(".") || sum.includes("Infinity")) setDotBlock(true);
        //чтоб не багался ресет
        if(sum.includes("Infinity")) setMathBlock(true);
      }     
    } 
      //логика для минуса
      //после точки нельзя его
    else if (entry === "-" && midInput[midInput.length-1]!==".") {      
      //для первого символа как отриц. значения
      if (midInput === "0" || midInput === "Dude stahp") {
        setResult("-");
        setMidInput("-");
      } else {
        const lastChar = midInput.charAt(midInput.length - 1);
        //если последний символ это оператор, то минус это отриц. значение
        if (operators.includes(lastChar) || midInput === "") {
          // если последний символ уже минус, то не добавляем его снова
          if (midInput !== "" && midInput.charAt(midInput.length - 1) === "-") {
            // Если последний символ уже минус, добавляем открывающую скобку
            setResult((prevResult) => prevResult + "(");
            setMidInput((prevMidInput) => prevMidInput + "(");
          }
        } else {
          // иначе минус является оператором вычитания
          setMathBlock(true);
        }
        setDotBlock(false); 
        setResult(entry);
        setMidInput((prevMidInput) => prevMidInput + entry);
      }
    }
       //для остальных операторов (+,/,*)
    else if (isNaN(parseInt(entry, 10)) && !mathBlock) {   
      //нельзя добавить 2 оператора подряд
      setMathBlock(true);
      //новое число после оператора, можно опять добавить точку
      setDotBlock(false);     
      setResult(entry);
      //закрываем скобки, которые остались после 2х минусов подряд
      const brackets = findMissingBrackets(midInput);     
      setMidInput((prevMidInput) => prevMidInput + brackets + entry);  
    } 
      //логика для цифр
    else if (!isNaN(parseInt(entry, 10))) {      
      if (midInput === "Dude stahp" || midInput === "0") {
        setMidInput("");
      }
      if (result === "0" || isNaN(result)) {
        setResult("");
      }
      //после цифр можно опять добавить операторы
      setMathBlock(false);      
      setResult(result==="0" ? entry : (prevResult) => prevResult + entry);
      setMidInput(midInput==="0" ? entry : (prevMidInput) => prevMidInput + entry);

      //если слишком много символов в поле ввода и midInput, обнуляет ввод
      if (midInput.length > 25 || result.length > 10) {
        setMidInput("Dude stahp");
        setResult("0");
        setMathBlock(true);
      }
    }

  };
  
  return (
    <div className="App">
      <div className="container-fluid mainpanel">
        <div className="row text-center">
          <div className="col-xs-12 headline">
            Calculator
          </div>
        </div>
        <div id="output">
          <div className="row text-center">
            <div id="total" className="col-xs-12">
              {result}
            </div>
          </div>
          <div className="row text-center" style={{ marginBottom: '3%' }}>
            <div id="mid-input" className="col-xs-12">
              {midInput}
            </div>
          </div>
        </div>
        <div id="buttons" className="buttons-container">
          {buttons.map((button, index) => (
            <button id={button} key={index} onClick={() => handleClick(button)} value={button}>
              {button}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
