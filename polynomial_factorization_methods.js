function kroneckersMethod(pol)
{
    if(isMemberOfPolynomials(pol) || (pol.getDegree() === 1 && pol.coefficients[1] === 1))
    {
        return [pol];
    }
    else
    {
        pols.push(pol);
    }

    let degree = pol.getDegree();
    let a = new Polynomial([1]);
    let b = new Polynomial([1]);
    let ret = new Array(0);
    let toFactorize = false;

    if(pol.getDegree() > 0)
    {
        methodLog("Wielomian do sfaktoryzowania: ");
        methodLog(pol.toHTMLStringBackward());
        //find divisors
        let matrixOfDivisors = new Array(new Array(0));
        let divisors = [];
        let xValue = 0;
        let yValue = 0;
        let rootFound = false;
        matrixOfDivisors.pop();
        let X = new Array(0);

        let nrOfPoints = Math.ceil(degree/2) + 1;
        let bestPoints = getBestPoints(nrOfPoints, pol);

        for (let i = 0; i < nrOfPoints; i++)
        {
            xValue = bestPoints[0][i];
            X.push(xValue);
            yValue = bestPoints[1][i];

            if(yValue === 0) //if root found
            {
                a = new Polynomial([-1*xValue, 1]);
                b = pol.divide(a);
                rootFound = true;
                methodLog("Znaleziono pierwiastek f(" + xValue + ") = " + yValue);
                methodLog("a = " + a.toHTMLStringBackward());
                methodLog("b = " + b.toHTMLStringBackward());
                break;
            }

            divisors = findDivisors(pol.f(xValue));
            matrixOfDivisors.push(divisors);
            methodLog("Dzielniki dla f(" + xValue + ") = " + yValue, false, true);
            methodLog("{");
            methodLog("   ", false,false);
            for (let j = 0; j < divisors.length; j++)
            {
                methodLog(divisors[j] + "; ", false, false);
            }
            methodLog("", false, true);
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

                methodLog("X = ", false, false);
                for (let i = 0; i < X.length; i++)
                {
                    methodLog(X[i] + "; ", false, false);
                }
                methodLog("", false, true);

                methodLog("Y = ", false, false);
                for (let i = 0; i < X.length; i++)
                {
                    methodLog(Y[i] + "; ", false, false);
                }
                methodLog("", false, true);

                a = lagrangeInterpolationPolynomial(Math.round(degree/2),X,Y);
                methodLog("a = " + a.toHTMLStringBackward());

                //divide main polynomial by found polynomial
                b = pol.divide(a);

                if(isMemberOfPolynomials(a))
                {
                    methodLog("Wielomian " + a.toHTMLStringBackward() + " już był ");
                }
                else if((a.getDegree() === 0 && a.coefficients[0] === 1) || (a.getDegree() === 0 && a.coefficients[0] === -1))
                {
                    methodLog("Wielomian " + a.toHTMLStringBackward() + " nie ma sensu ");
                }
                else if(!a.hasOnlyIntegerCoefficients())
                {
                    methodLog("Wielomian " + a.toHTMLStringBackward() + " ma niecałkowite współczynniki ");
                }
                else if(!b.hasOnlyIntegerCoefficients())
                {
                    methodLog("b = " + b.toHTMLStringBackward());
                    methodLog("Wielomian " + b.toHTMLStringBackward() + " ma niecałkowite współczynniki ");
                }
                else if(b.getDegree() >= 0 && a.hasOnlyIntegerCoefficients() && b.hasOnlyIntegerCoefficients())
                {
                    methodLog("b = " + b.toHTMLStringBackward());
                    toFactorize = true;
                    break;
                }
                else
                {
                    methodLog("Wielomian " + pol.toHTMLStringBackward() + " nie jest podzielny przez " + a.toHTMLStringBackward());
                }

                customNr = customNr.add(customOne);
            }
            while (customNr.toDecNr() !== 0);

            if(!toFactorize)
            {
                return [pol];
            }
        }

        //return ingredients of factorized polynomial if no recursion needed
        if (a.getDegree() <= 0 && b.getDegree() <= 0)
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



function kroneckersHausmannsMethod(pol)
{
    if(isMemberOfPolynomials(pol) || (pol.getDegree() === 1 && pol.coefficients[1] === 1))
    {
        return [pol];
    }
    else
    {
        pols.push(pol);
    }

    let degree = pol.getDegree();
    let a = new Polynomial([1]);
    let b = new Polynomial([1]);
    let ret = new Array(0);
    let toFactorize = false;
    let m = 1;
    let isMoved = false;

    if(pol.getDegree() <= 0)
    {
        ret = [pol];
        return ret;
    }

    methodLog("Wielomian do sfaktoryzowania: ");
    methodLog(pol.toHTMLStringBackward());

    if(pol.isStable())
    {
        methodLog("Wielomian " + pol.toHTMLStringBackward() + " jest stabilny", false, true);
    }
    else
    {
        m = getM(pol);
        methodLog("Wielomian " + pol.toHTMLStringBackward() + " nie jest stabilny", false, true);

        pol = pol.getPolynomialMovedByVector([-m,0]);
        isMoved = true;
        methodLog("Wielomian przesunięty o " + m + " w lewo aby był stabilny: " + pol.toHTMLStringBackward(), false, true);
    }

    //find divisors
    let matrixOfDivisors = [];
    let divisors = [];
    let xValue = 0;
    let yValue = 0;
    let rootFound = false;
    let X = new Array(0);

    let nrOfPoints = Math.ceil(degree/2) + 1;
    let bestPoints = getBestPoints(nrOfPoints, pol);

    for (let i = 0; i < nrOfPoints; i++)
    {
        xValue = bestPoints[0][i];
        X.push(xValue);
        yValue = bestPoints[1][i];

        if(yValue === 0) //if root found
        {
            a = new Polynomial([-1*xValue, 1]);
            b = pol.divide(a);
            rootFound = true;
            methodLog("Znaleziono pierwiastek f(" + xValue + ") = " + yValue);
            methodLog("Wielomian a = " + a.toHTMLStringBackward());
            methodLog("Wielomian b = " + b.toHTMLStringBackward());

            methodLog("Wielomian a przesunięty z powrotem = " + a.getPolynomialMovedByVector([m,0]).toHTMLStringBackward());
            methodLog("Wielomian b przesunięte z powrotem = " + b.getPolynomialMovedByVector([m,0]).toHTMLStringBackward());
            break;
        }

        divisors = findDivisors(pol.f(xValue));
        matrixOfDivisors.push(divisors);
        methodLog("Dzielniki dla f(" + xValue + ") = " + yValue, false, true);
        methodLog("{");
        methodLog("   ", false,false);
        for (let j = 0; j < divisors.length; j++)
        {
            methodLog(divisors[j] + "; ", false, false);
        }
        methodLog("", false, true);
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

            methodLog("X = ", false, false);
            for (let i = 0; i < X.length; i++)
            {
                methodLog(X[i] + "; ", false, false);
            }
            methodLog("", false, true);

            methodLog("Y = ", false, false);
            for (let i = 0; i < X.length; i++)
            {
                methodLog(Y[i] + "; ", false, false);
            }
            methodLog("", false, true);

            a = newtonInterpolationPolynomial(Math.round(degree/2),X,Y);
            methodLog("Wielomian a = " + a.toHTMLStringBackward());
            methodLog("Wielomian a przesunięty z powrotem = " + a.getPolynomialMovedByVector([m,0]).toHTMLStringBackward());

            //divide main polynomial by found polynomial
            b = pol.divide(a);

            if(isMemberOfPolynomials(a))
            {
                methodLog("Wielomian " + a.toHTMLStringBackward() + " już był ");
            }
            else if((a.getDegree() === 0 && a.coefficients[0] === 1) || (a.getDegree() === 0 && a.coefficients[0] === -1))
            {
                methodLog("Wielomian " + a.toHTMLStringBackward() + " nie ma sensu ");
            }
            else if(!a.hasOnlyIntegerCoefficients())
            {
                methodLog("Wielomian " + a.toHTMLStringBackward() + " ma niecałkowite współczynniki ");
            }
            else if(!b.hasOnlyIntegerCoefficients())
            {
                methodLog("b = " + b.toHTMLStringBackward());
                methodLog("Wielomian " + b.toHTMLStringBackward() + " ma niecałkowite współczynniki ");
            }
            else if(b.getDegree() >= 0 && a.hasOnlyIntegerCoefficients() && b.hasOnlyIntegerCoefficients())
            {
                methodLog("Wielomian b = " + b.toHTMLStringBackward());
                methodLog("Wielomian b przesunięte z powrotem = " + b.getPolynomialMovedByVector([m,0]).toHTMLStringBackward());

                toFactorize = true;
                break;
            }
            else
            {
                methodLog("Wielomian " + pol.toHTMLStringBackward() + " nie jest podzielny przez " + a.toHTMLStringBackward());
            }

            customNr = customNr.add(customOne);
        }
        while (customNr.toDecNr() !== 0);

        if(!toFactorize)
        {
            if(isMoved)
            {
                pol = pol.getPolynomialMovedByVector([m,0]);
            }
            return [pol];
        }
    }

    //return ingredients of factorized polynomial if no recursion needed
    if (a.getDegree() <= 0 && b.getDegree() <= 0)
    {
        if (a.getDegree() < 0 || b.getDegree() < 0
            || !a.hasOnlyIntegerCoefficients()
            || !b.hasOnlyIntegerCoefficients())
        {
            if(isMoved)
            {
                pol = pol.getPolynomialMovedByVector([m,0]);
            }
            return [pol];
        }
        else
        {
            if(isMoved)
            {
                a = a.getPolynomialMovedByVector([m,0]);
                b = b.getPolynomialMovedByVector([m,0]);
            }
            return [a,b];
        }
    }

    //if recursion needed
    let L = kroneckersHausmannsMethod(a);
    let P = kroneckersHausmannsMethod(b);

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



function getM(pol)
{
    let m = 0;
    let a0 = 0;
    let ak = 0;

    for (let i = 0; i < pol.getDegree() + 1; i++)
    {
        a0 = pol.coefficients[0];
        ak = pol.coefficients[i];
        if(Math.abs(ak/a0) > m)
        {
            m = Math.abs(ak/a0);
        }
    }

    return m;
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
            if (j !== i)
            {
                nominator = nominator.multiply(new Polynomial([-X[j], 1])); //(x - X[j])
                dominator *= (X[i] - X[j]); // multiply polynomial dominator by scalar (X[i]-X[j])
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

    for (let i = 0; i < result.coefficients.length ; i++)
    {
        result.coefficients[i] = Math.round(1000000 * result.coefficients[i]) / 1000000;
    }

    return result;
}



function newtonInterpolationPolynomial(degree, X, Y)
{
    let n = degree + 1;
    let result = new Polynomial([0]);
    let product, b, binomial;
    let table = generateNewtonsTable(X, Y);
    let coefficients = getCoefficients(table);

    for (let i = 0; i < n; i++)
    {
        product = new Polynomial([1]);
        b = new Polynomial([coefficients[i]]);
        product = product.multiply(b);

        for (let j = 0; j < i; j++)
        {
            binomial = new Polynomial([-X[j],1]);
            product = product.multiply(binomial);
        }

        result = result.add(product);
    }

    // Trim leading zeros in the result
    while (result.coefficients.length > 1 && result.coefficients[result.coefficients.length - 1] === 0)
    {
        result.coefficients.pop();
    }

    for (let i = 0; i < result.coefficients.length ; i++)
    {
        result.coefficients[i] = Math.round(1000000 * result.coefficients[i]) / 1000000;
    }

    return result;
}



function generateNewtonsTable(X, Y)
{
    let nrOfSteps = X.length - 1;
    let table = [];
    table.push(X);
    table.push(Y);
    let step = 1;
    addCol(table, X, Y, step, nrOfSteps);
    return table;
}



function addCol(table, X, Y, step, nrOfSteps)
{
    let col = [];
    for (let i = 0; i < Y.length - 1; i++)
    {
        col.push((Y[i + 1] - Y[i]) / (X[i + step] - X[i]));
    }
    table.push(col);
    step++;
    if (step >= 2 && nrOfSteps >= step)
    {
        addCol(table, X, table[table.length - 1], step, nrOfSteps);
    }
}



function getCoefficients(table)
{
    let coefficients = [];
    for (let i = 1; i < table.length; i++)
    {
        coefficients.push(table[i][0]);
    }
    return coefficients;
}



function isIncreasingSequence(seq)
{
    for (let i = 1; i < seq.length; i++)
    {
        if (seq[i] < seq[i - 1])
        {
            return false;
        }
    }
    return true;
}



function getBestPoints(nrOfPoints, pol)
{
    let combinedArray = [];
    let X = [];
    let Y = [];

    let x,y,nrOfDivisors;

    for (let i = -4 * nrOfPoints; i < 4 * nrOfPoints; i++)
    {
        x = i;
        y = pol.f(x);
        if(y == 0)
        {
            nrOfDivisors = 0;
        }
        else
        {
            nrOfDivisors = findDivisors(y).length;
        }

        combinedArray.push({x,y,nrOfDivisors});
    }

    combinedArray.sort((a,b) => a.nrOfDivisors - b.nrOfDivisors); //sort by nrOfDivisors

    for (let i = 0; i < nrOfPoints; i++)
    {
        X[i] = combinedArray[i].x;
        Y[i] = combinedArray[i].y;
    }

    return [X,Y];
}



function getPoints(nrOfPoints, pol)
{
    let X = [];
    let Y = [];

    let x,y;

    for (let i = 0 ; i < nrOfPoints; i++)
    {
        x = i - Math.round(nrOfPoints/2);
        y = pol.f(x);

        X.push(x);
        Y.push(y);
    }

    return [X,Y];
}



function isMemberOfPolynomials(pol)
{
    for (let i = 0; i < pols.length; i++)
    {
        if(pols[i].isEqual(pol))
        {
            return true;
        }
    }

    return false;
}
