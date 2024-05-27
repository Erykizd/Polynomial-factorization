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
        let divisorsStr = "";
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
            divisorsStr = arrayToString(divisors);
            methodLog("Dzielniki dla f(" + xValue + ") = " + yValue, true, true);
            methodLog(divisorsStr, false, true);
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

                methodLog("X = ", true, false);
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

        //return sequence of polynomials
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
        return [pol];
    }

    methodLog("Wielomian do sfaktoryzowania: ");
    methodLog(pol.toHTMLStringBackward());

    if(isStableByHurwitz(pol))
    {
        methodLog("Wielomian " + pol.toHTMLStringBackward() + " jest stabilny ", false, true);
    }
    else
    {
        m = getM(pol);
        methodLog("Wielomian " + pol.toHTMLStringBackward() + " nie jest stabilny ", false, true);
        methodLog("Wyznaczamy m = " + m, false, true);

        pol = pol.getPolynomialMovedByVector([-(m+1),0]);
        isMoved = true;
        methodLog("Wielomian przesunięty o (m+1) = " + (m+1) + " w lewo aby był stabilny: " + pol.toHTMLStringBackward(), false, true);
    }

    //find divisors
    let matrixOfDivisors = [];
    let divisors = [];
    let divisorsStr = "";
    let xValue = 0;
    let yValue = 0;
    let rootFound = false;
    let X = new Array(0);
    let Y = new Array(0);

    let nrOfPoints = Math.ceil(degree/2) + 1;
    let points = getBestPoints(nrOfPoints, pol);

    for (let i = 0; i < nrOfPoints; i++)
    {
        xValue = points[0][i];
        X.push(xValue);
        yValue = points[1][i];
        Y.push(yValue);

        if(yValue === 0) //if root found
        {
            a = new Polynomial([-1*xValue, 1]);
            b = pol.divide(a);

            rootFound = true;
            methodLog("Znaleziono pierwiastek f(" + xValue + ") = " + yValue);
            methodLog("Wielomian a = " + a.toHTMLStringBackward());
            methodLog("Wielomian b = " + b.toHTMLStringBackward());

            if(isMoved)
            {
                a = a.getPolynomialMovedByVector([(m+1),0])
                b = b.getPolynomialMovedByVector([(m+1),0])
                methodLog("Wielomian a przesunięty z powrotem = " + a.toHTMLStringBackward());
                methodLog("Wielomian b przesunięte z powrotem = " + b.toHTMLStringBackward());
            }
            break;
        }

        divisors = findDivisors(pol.f(xValue));
        matrixOfDivisors.push(divisors);
        divisorsStr = JSON.stringify(divisors).replaceAll(",",";");
        methodLog("Dzielniki dla f(" + xValue + ") = " + yValue, true, true);
        methodLog(arrayToString(divisorsStr), false, true);
    }

    if(!rootFound) //if there were no roots till now
    {
        //find polynomial by points
        let interY = new Array(X.length);

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
                interY[i] = matrixOfDivisors[i][customNr.getNr()[i]]; //setting y values according to custom nr
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
                methodLog(interY[i] + "; ", false, false);
            }
            methodLog("", false, true);

            if(areTheseDivisorsToSkip(Y,interY))
            {
                methodLog("Zestaw dzielników do pominięcia");
                customNr = customNr.add(customOne);
                continue;
            }

            a = newtonInterpolationPolynomial(Math.round(degree/2),X,Y);
            methodLog("Wielomian a = " + a.toHTMLStringBackward());

            if(isMoved)
            {
                methodLog("Wielomian a przesunięty z powrotem = " + a.getPolynomialMovedByVector([(m+1),0]).toHTMLStringBackward());
            }

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
                if(isMoved)
                {
                    methodLog("Wielomian b przesunięty z powrotem = " + b.getPolynomialMovedByVector([(m+1),0]).toHTMLStringBackward());
                }

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
                return [pol.getPolynomialMovedByVector([(m+1),0])];
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
                return [pol.getPolynomialMovedByVector([(m+1),0])];
            }
            return [pol];
        }
        else
        {
            if(isMoved)
            {
                return [a.getPolynomialMovedByVector([(m+1),0]),
                    b.getPolynomialMovedByVector([(m+1),0])];
            }
            return [a,b];
        }
    }

    //if recursion needed
    let L = kroneckersHausmannsMethod(a);
    let P = kroneckersHausmannsMethod(b);

    if(!((a.getDegree() > 1 || b.getDegree() > 1) && L[0] !== a && P[0] !== b)) //if recursion finished
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
    else
    {
        ret = [pol];
    }

    return ret;
}

function getSequencesOfDivisors(a,b)
{
    let c = [];
    for (let i = 0; i < b.length; i++)
    {
        c[i] = a[i]/b[i];
    }

    return [b,c];
}

function areTheseDivisorsToSkip(a,b)
{
    //a_i=b_i*c_i
    let c = getSequencesOfDivisors(a,b)[1];

    let bIncreasing = isIncreasingSequence(b);
    let cIncreasing = isIncreasingSequence(c);

    methodLog("Wartości a = " + JSON.stringify(a), true, false);
    methodLog("Dzielniki b = " + JSON.stringify(b), true, false);
    methodLog("Dzielniki c = " + JSON.stringify(c), true, true);

    if( !bIncreasing )
    {
        methodLog("Widać, że wartości b nie rosną b = " + JSON.stringify(b), true, true);
        return false;
    }

    if( !cIncreasing )
    {
        methodLog("Widać, że wartości c nie rosną c = " + JSON.stringify(c), true, true);
        return false;
    }

    let deg1;
    let deg2;

    let bDifferenceTable = getDifferenceTable(b);
    let cDifferenceTable = getDifferenceTable(c);

    methodLog("Tablica różnicowa dla b: ",true, true);
    for (let i = 0; i < bDifferenceTable.length; i++)
    {
        methodLog(JSON.stringify(bDifferenceTable[i]).replaceAll(",",";"),false, true);
    }

    methodLog("Tablica różnicowa dla c: ",true, true);
    for (let i = 0; i < cDifferenceTable.length; i++)
    {
        methodLog(JSON.stringify(cDifferenceTable[i]).replaceAll(",",";"),false, true);
    }

    let newB = bDifferenceTable[bDifferenceTable.length - 1];
    let theSameNrsInB = areAllElementsEqual(newB);

    let newC = bDifferenceTable[bDifferenceTable.length - 1];
    let theSameNrsInC = areAllElementsEqual(newC);

    return !(theSameNrsInB && theSameNrsInC); //if not constant sequences return skip = true
}

function diff(array)
{
    let result = [];
    for (let i = 1; i < array.length; i++)
    {
        result.push(array[i] - array[i - 1]);
    }
    return result;
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

function getDifferenceTable(seq)
{
    let componentsTable = [];
    componentsTable.push(seq);

    for (let i = 1; i < seq.length; i++)
    {
        componentsTable.push(diff(componentsTable[i-1]));
        for (let j = 1; j < componentsTable[i].length; j++)
        {
            if(componentsTable[i][j] == componentsTable[i][0])
            {
                return componentsTable;
            }
        }
    }

    return componentsTable;
}

function areAllElementsEqual(array)
{
    for (const element in array)
    {
        if(element !== array[0])
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
        if(y === 0)
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

function getMatrixOfCoefficients(a, n = a.length)
{
    let matHelp = [];
    let row = [];

    for (let i = 0; i < n; i++)
    {
        row = [];
        for (let j = 0; j < n; j++)
        {
            if(2*(i+1)-(j+1) < 0 || 2*(i+1)-(j+1) + 1 > a.length)
            {
                row.push(0);
            }
            else
            {
                row.push(a[2*(i+1)-(j+1)]);
            }
        }
        matHelp.push(row);
    }

    return new Matrix(matHelp);
}

function isStableByHurwitz(pol)
{
    let sign = pol.coefficients[0] / pol.coefficients[0];

    for (let i = 1; i < pol.coefficients.length; i++)
    {
        if(pol.coefficients[i] / pol.coefficients[i] !== sign) //if different sign or a_i smaller than a_i-1
        {
            methodLog("Współczynniki o różnych znakach: ", true, true);
            methodLog(arrayToString(pol.coefficients), false, true);
            return false; //polynomial is not stable because not all signs are the same
        }
    }

    let det;
    for (let i = 1; i < pol.coefficients.length; i++)
    {
        det = getMatrixOfCoefficients(pol.coefficients,i).det();
        methodLog("W" + i + " = " + det, true, false);
        methodLog((det > 0 ? " > " : det < 0 ? " < " : " = ") + "0", false, true);

        if(det < 0) //if different sign or a_i smaller than a_i-1
        {
            methodLog("Wyznacznik ujemny", true, false);
            return false; //polynomial is not stable by Hurwitz
        }

        if(det === 0) //if different sign or a_i smaller than a_i-1
        {
            methodLog("Wyznacznik równy zero", true, false);
            return false; //polynomial is not stable by Hurwitz
        }
    }

    return true;
}
