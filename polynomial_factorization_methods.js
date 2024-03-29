function kroneckersMethod(pol)
{
    let degree = pol.getDegree();
    let a = new Polynomial([1]);
    let b = new Polynomial([1]);
    let ret = new Array(0);

    methodLog("Wielomian do sfaktoryzowania: ");
    methodLog(pol.toHTMLstring());

    if(pol.getDegree() > 1)
    {
        //find divisors
        let matrixOfDivisors = new Array(new Array(0));
        let divisors = [];
        let xValue = 0;
        let yValue = 0;
        let rootFound = false;
        matrixOfDivisors.pop();
        let X = new Array(0);

        for (let i = 0; i < Math.ceil(degree/2) + 1; i++)
        {
            xValue = i-1;
            X.push(xValue);
            yValue = pol.f(xValue);

            if(yValue === 0)
            {
                a = new Polynomial([-1*xValue, 1]);
                b = pol.divide(a);
                rootFound = true;
                methodLog("Znaleziono pierwiastek f(" + xValue + ") = " + yValue);
                methodLog("a = " + a.toHTMLstring());
                methodLog("b = " + b.toHTMLstring());
                break;
            }

            divisors = findDivisors(pol.f(xValue));
            matrixOfDivisors.push(divisors);
            methodLog("Dzielniki dla f(" + xValue + ") = " + yValue, true);
            methodLog("{");
            methodLog("\t", false);
            for (let j = 0; j < divisors.length; j++)
            {
                methodLog(divisors[j] + "; ", false);
            }
            methodLog("", );
            methodLog("}", );
        }

        if(!rootFound) //if there were no roots till now
        {
            //find polynomial by points
            let Y = new Array(X.length);

            // getting lengths in matrixOfDivisors
            let Ls = [];
            for (let i = 0; i < matrixOfDivisors.length; i++)
            {
                Ls.push(matrixOfDivisors[i].length);
            }
            let customNr = new CustomNrSystem(Ls,0);
            let customOne = new CustomNrSystem(Ls,1);

            do
            {
                for (let i = 0; i < X.length; i++)
                {
                    Y[i] = matrixOfDivisors[i][customNr.getNr()[i]]; //setting y values according to custom nr
                }

                methodLog("X = ", false);
                for (let i = 0; i < X.length; i++)
                {
                    methodLog(X[i] + "; ", false);
                }
                methodLog("", true);

                methodLog("Y = ", false);
                for (let i = 0; i < X.length; i++)
                {
                    methodLog(Y[i] + "; ", false);
                }
                methodLog("", true);

                a = lagrangeInterpolationPolynomial(Math.round(degree/2),X,Y);
                methodLog("a = " + a.toHTMLstring());

                //divide main polynomial by found polynomial
                b = pol.divide(a);
                if(b.getDegree() >= 0)
                {
                    methodLog("b = " + b.toHTMLstring());
                }
                else
                {
                    methodLog("Wielomian " + pol.toHTMLstring() + " nie jest podzielny przez " + a.toHTMLstring());
                }

                if (a.getDegree() > 0 && b.getDegree() > 0)
                {
                    break;
                }

                customNr = customNr.add(customOne);
            }
            while (customNr.toDecNr() !== 0);
            if(b.getDegree() < 0)
            {
                return [pol];
            }
        }

        //return ingredients of factorized polynomial if no recursion needed
        if (a.getDegree() <= 1 && b.getDegree() <= 1)
        {
            if (a.getDegree() < 0 || b.getDegree() < 0
                || !a.hasOnlyIntegerCoefficients()
                || !b.hasOnlyIntegerCoefficients())
            {
                return [pol];
            }
            else
            {
                return [a,b];
            }
        }

        //if recursion needed
        let L = kroneckersMethod(a);
        let P = kroneckersMethod(b);

        if(!((a.getDegree() > 1 || b.getDegree() > 1) && L[0] !== a && P[0] !== b)) //if recursion needed
        {
            for (let i = 0; i < L.length; i++)
            {
                ret.push(L[i]);
            }
            for (let i = 0; i < P.length; i++)
            {
                ret.push(P[i]);
            }
        }
    }
    else
    {
        ret = [pol];
    }

    return ret;
}

function lagrangeInterpolationPolynomial(degree, X, Y)
{
    let n = degree + 1;
    let result = new Polynomial([0]);
    let fraction = new Polynomial([0])

    for (let i = 0; i < n; i++)
    {
        let nominator = new Polynomial([1]);
        let dominator = 1;
        for (let j = 0; j < n; j++)
        {
            if (j != i)
            {
                nominator = nominator.multiply(new Polynomial([-X[j], 1])); //(x - X[j])
                dominator *= (X[i] - X[j]); //multiply polynomial dominator by scalar (X[i]-X[j])
            }
        }

        fraction = nominator.divide(dominator);
        fraction = fraction.multiply(Y[i]);
        result = result.add(fraction);
    }

    // Trim leading zeros in the result
    while (result.coefficients.length > 1 && result.coefficients[result.coefficients.length - 1] === 0)
    {
        result.coefficients.pop();
    }

    return result;
}
