let inputs = window.document.getElementsByClassName("coefficient");
let modules = window.document.getElementsByClassName("module");
let methodSelector = window.document.getElementById("methodSelector");
let pols = [];
let inputPolynomial;
let chartController;
let basicColors = ["red", "green", "blue", "yellow", "cyan", "magenta", "orange", "purple", "pink", "brown", "black", "white", "gray", "lime", "maroon", "navy", "olive", "teal", "aqua", "fuchsia", "silver", "gold"];


setup();

function setup()
{
	inputPolynomial = getInputPolynomial();

	chartController = new ChartController("chart");

	setMethodSelector();

	inputs[0].addEventListener("change", () =>
	{
		addModule();
		inputChanged(document.getElementById("autoFactor").checked);
	});

	document.getElementById("factorButton").addEventListener("click", () =>
	{
		inputChanged(true);
	});

	document.getElementById("autoFactor").addEventListener("change", () =>
	{
		inputChanged(true);
	});
}


function inputChanged(doIt = true)
{
	if(doIt)
	{
		inputPolynomial = getInputPolynomial();
		let X;
		let Y;
		let roots = [];
		[X,Y] = getDataToDraw(-5,5,0.1);
		clearMethodLogs();

		document.getElementById("bufforing").classList.remove("hidden");
		document.getElementById("output").classList.add("hidden");

		setTimeout(()=>
		{
			factorPolynomial()
				.then((message) =>
				{
					console.log(message); // Wyświetla komunikat po zakończeniu obliczeń
					document.getElementById("bufforing").classList.add("hidden");
					document.getElementById("output").classList.remove("hidden");
				})
				.catch((error) =>
				{
					console.error(error); // Obsługuje ewentualny błąd
				});
		}, 10);
		chartController.plot(X,Y,0,inputPolynomial.toStringBackward(),"lime",2);
	}
}


function addModule()
{
	let newModule = modules[0].cloneNode(true);
	let newInput = newModule.querySelector('input[type="number"]');

	newInput.addEventListener("change", () =>
	{
		inputChanged(document.getElementById("autoFactor").checked);
	});

	let insertedValue = Number(inputs[inputs.length - 1].value); //remember inserted value before adding new module

	modules[0].parentNode.insertBefore(newModule, modules[modules.length-1]); // inserting new module

	correctModules(insertedValue);
}


function correctModules(insertedValue)
{
	let powers = document.getElementsByClassName("power");
	let signs = document.getElementsByClassName("sign");

	for(let i = 0; i < powers.length; i++)
	{
		if(i > 0)
		{
			signs[i].innerHTML = " + ";
		}

		if(i === 0)
		{
			powers[i].innerHTML = " ";
		}
		else if(i === 1)
		{
			powers[i].innerHTML = "x ";
		}
		else if(powers.length === i + 1)
		{
			powers[i].innerHTML = "x<sup>" + i + "</sup> ";
		}
		else
		{
			powers[i].innerHTML = "x<sup>" + i + "</sup> ";
		}
	}

	inputs[inputs.length - 2].value = insertedValue;
	inputs[inputs.length - 1].value = "";
	inputs[inputs.length - 1].parentElement.id = "lastModule";
}

function setMethodSelector()
{
	let opt;
	let optsNames = ["Metoda Kroneckera", "Metoda Kroneckera Hausmanna"];

	for (let i = 0; i < 2; i++)
	{
		opt =  window.document.createElement("option");
		opt.value = toString(i);
		opt.innerText = optsNames[i];
		methodSelector.appendChild(opt);
	}

	methodSelector.selectedIndex = 0;

	let selectedIndexFromLocalStorage = localStorage.getItem("selectedMethodIndex");

	if(selectedIndexFromLocalStorage !== null)
	{
		methodSelector.selectedIndex = selectedIndexFromLocalStorage;
	}

	methodSelector.addEventListener("change", ()=>
	{
		clearMethodLogs();
		setTimeout(()=>
		{
			factorPolynomial()
				.then((message) =>
				{
					console.log(message); // Wyświetla komunikat po zakończeniu obliczeń
					document.getElementById("bufforing").classList.add("hidden");
					document.getElementById("output").classList.remove("hidden");
				})
				.catch((error) =>
				{
					console.error(error); // Obsługuje ewentualny błąd
				});
		}, 10);
	});
}

function disp(txt)
{
	console.log(txt);
}

function getDataToDraw(x_min,x_max,dx,pol = inputPolynomial)
{
	let X = [];
	let Y = [];

	let nrOfPoints = (x_max - x_min) / dx
	let x = 0;
	let y = 0;

	for(let i = 0; i <= nrOfPoints; i++)
	{
		x = x_min + i * dx;
		X.push(Math.round(1000000*x)/1000000);
		y = pol.f(x);
		Y.push(y);
		y = 0;
	}

	return [X,Y];
}


function getRoots()
{
	roots = [];
	let min = Math.min(Number(inputs[0].value),Number(inputs[inputs.length - 2].value));
	let max = Math.max(Number(inputs[0].value),Number(inputs[inputs.length - 2].value));

	for (let i = min; i <= max; i++)
	{
		if(inputPolynomial.f(i) === 0)
		{
			roots.push(i);
		}
	}

	return roots;
}

function factorPolynomial()
{
	return new Promise((resolve, reject) =>
	{
		console.clear();
		pols = [];
		let str = "";
		let p = document.getElementById("factoredPolynomial");
		p.innerHTML = "";
		inputPolynomial = getInputPolynomial();
		document.getElementById("mainPolynomial").innerHTML = inputPolynomial.toHTMLStringBackward();

		localStorage.setItem("selectedMethodIndex", methodSelector.selectedOptions[0].index);

		let polynomialFactors;
		switch (methodSelector.selectedOptions[0].index)
		{
			case 0:
				polynomialFactors = kroneckersMethod(inputPolynomial);
				break;
			case 1:
				polynomialFactors = kroneckersHausmannsMethod(inputPolynomial);
				break;
			default:
				polynomialFactors = kroneckersMethod(inputPolynomial);
		}

		let X = [];
		let Y = [];
		let name = "";
		chartController.clear();
		[X, Y] = getDataToDraw(-20, 20, 0.1, inputPolynomial)
		chartController.plot(X, Y, 0, inputPolynomial.toStringBackward(), "lime", 2);

		for (let i = 0; i < polynomialFactors.length; i++)
		{
			if (polynomialFactors.length > 1)
			{
				str += "(";
			}
			str += polynomialFactors[i].toHTMLStringBackward();
			if (polynomialFactors.length > 1)
			{
				str += ")";
			}

			[X, Y] = getDataToDraw(-20, 20, 0.1, polynomialFactors[i]);
			name = polynomialFactors[i].toStringBackward();
			chartController.plot(X, Y, i + 1, name, basicColors[i % basicColors.length], 2);
		}

		p.innerHTML = str;
		resolve("Factorization completed successfully.");
	});
}

function findDivisors(number)
{
	let divisors = [];

	if(number === 0)
	{
		for (let i = 0; i <= 15; i++)
		{
			divisors.push(i);
		}
		return divisors;
	}

	for (let i = -Math.ceil(Math.sqrt(Math.abs(number))); i <= Math.ceil(Math.sqrt(Math.abs(number))); i++)
	{
		if (i !== 0 && number % i === 0)
		{
			divisors.push(i);
			if(i !== Math.sqrt(Math.abs(number)) && i !== -Math.sqrt(Math.abs(number)))
			{
				divisors.push(number / i);
			}
		}
	}

	divisors.sort((a,b)=>a-b);

	return divisors;
}

function getInputPolynomial()
{
	let polynomial = new Polynomial(new Array(modules.length - 1));

	for (let i = 0; i < modules.length - 1; i++)
	{
		polynomial.coefficients[i] = Number(inputs[i].value);
	}

	return polynomial;
}

function arrayToString(arr)
{
	return JSON.stringify(arr).replaceAll(",",";").replaceAll("[","{").replaceAll("]","}").replaceAll("\"","");
}
