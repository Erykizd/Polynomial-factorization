var inputs = window.document.getElementsByClassName("coefficient");
var modules = window.document.getElementsByClassName("module");

var options =
	{
		responsive: true,
		maintainAspectRatio: false,
		scales: {
			x: {
				display: true, // Show OX
				title:
					{
						display: true,
						text: 'x' // Tiltle of OX
					}
			},
			y: {
				display: true, // Show OY
				title:
					{
						display: true,
						text: 'y' // Title of OY
					}
			}
		}
	};
var data =
	{
		labels: [],
		datasets:
			[{
				label: "Wykres podanego wielomianu",
				data: [],
				borderColor: "lime",
				borderWidth: 2,
				fill: false
			}]
	};
var ctx = document.getElementById("chart").getContext("2d");
var chart = new Chart(ctx,
	{
		type: 'line',
		data: data,
		options: options
	});

setup();

function setup()
{
	inputs[0].addEventListener("change", () =>
	{
		addModule();
		inputChanged();
	});
}

function inputChanged()
{
	let X;
	let Y;
	let roots = [];
	[X,Y] = getDataToDraw(-5,5,0.1);
	clearMethodLogs();
	factorPolynomial();
	plot(X,Y);
}

function addModule()
{
	let newModule = modules[0].cloneNode(true);
	let newInput = newModule.querySelector('input[type="number"]');

	newInput.addEventListener("change", () =>
	{
		inputChanged();
	});

	let insertedValue = Number(inputs[inputs.length - 1].value); //remember inserted value before adding new module

	modules[0].parentNode.insertBefore(newModule, modules[modules.length-1]); // inserting new module

	correctModules(insertedValue);
}


function correctModules(insertedValue)
{
	let powers = document.getElementsByClassName("power");

	for(let i = 0; i < powers.length; i++)
	{
		if(i == 0)
		{
			powers[i].innerHTML = " + ";
		}
		else if(i == 1)
		{
			if(i == powers.length - 1)
			{
				powers[i].innerHTML = "x ";
			}
			else
			{
				powers[i].innerHTML = "x + ";
			}
		}
		else if(i == powers.length - 1)
		{
			powers[i].innerHTML = "x<sup>" + i + "</sup> ";
		}
		else
		{
			powers[i].innerHTML = "x<sup>" + i + "</sup> + ";
		}
	}

	inputs[inputs.length - 2].value = insertedValue;
	inputs[inputs.length - 1].value = "";
}

function disp(txt)
{
	console.log(txt);
}

function plot(X,Y)
{
	chart.data.labels = X;
	chart.data.datasets[0].data = Y;
	chart.update();
}

function getDataToDraw(x_min,x_max,dx)
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
		y = f(x);
		Y.push(y);
		y = 0;
	}

	return [X,Y];
}

function f(x)
{
	let a = 0;
	let y = 0;

	for(let j = 0; j < inputs.length; j++)
	{
		a = Number(inputs[j].value);
		y = y + a*(Math.pow(x, j));
	}

	return y;
}


function getRoots()
{
	roots = [];
	let min = Math.min(Number(inputs[0].value),Number(inputs[inputs.length - 2].value));
	let max = Math.max(Number(inputs[0].value),Number(inputs[inputs.length - 2].value));

	for (let i = min; i <= max; i++)
	{
		if(f(i) === 0)
		{
			roots.push(i);
		}
	}

	return roots;
}

function factorPolynomial()
{
	let str = "";
	let p = document.getElementById("factoredPolynomial");

	let pol = getInputPolynomial();
	document.getElementById("mainPolynomial").innerHTML = pol.toHTMLstring();

	let kroneckersPolynomials = kroneckersMethod(pol);

	for (let i = 0; i < kroneckersPolynomials.length; i++)
	{
		if(kroneckersPolynomials.length > 1)
		{
			str += "(";
		}
		str += kroneckersPolynomials[i].toHTMLstring();
		if(kroneckersPolynomials.length > 1)
		{
			str += ")";
		}
	}

	p.innerHTML = str;
}

function findDivisors(number)
{
	let divisors = [];

	if(number == 0)
	{
		for (let i = -10; i <= 10; i++)
		{
			divisors.push(i);
		}
		return divisors
	}

	for (let i = -Math.abs(number); i <= Math.abs(number); i++)
	{
		if (i != 0 && number % i === -0)
		{
			divisors.push(i);
		}
	}

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

function methodLog(text, endLine = true)
{
	document.getElementById("methodsContent").innerHTML += text.toString();
	if(endLine)
	{
		document.getElementById("methodsContent").innerHTML += "<br>";
	}
}

function clearMethodLogs()
{
	document.getElementById("methodsContent").innerHTML = "";
}
