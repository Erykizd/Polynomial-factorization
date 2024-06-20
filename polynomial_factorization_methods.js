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
        methodLog("Wielomian, który chcemy sfaktoryzować: ");
        methodLog(pol.toHTMLStringBackward());
        methodLog("Wyznaczamy wartości w wybranych punktach, a następnie szukamy dzielników dla tych wartości");
        //find divisors
        let matrixOfDivisors = new Array(new Array(0));
        let divisors = [];
        let divisorsStr = "";
        let xValue = 0;
        let yValue = 0;
        let rootFound = false;
        matrixOfDivisors.pop();
        let X = new Array(0);

        let nrOfPoints = (Math.floor(degree/2) + 1) + 1; //degree of a + 1
        let points = getBestPointsSeparatedByEqualIntervals(nrOfPoints, pol);

        for (let i = 0; i < nrOfPoints; i++)
        {
            xValue = points[0][i];
            X.push(xValue);
            yValue = points[1][i];

            if(yValue === 0) //if root found
            {
                a = new Polynomial([-1*xValue, 1]);
                b = pol.divide(a);
                rootFound = true;
                methodLog("Przypadkowo znaleźliśmy pierwiastek f(" + xValue + ") = " + yValue);
                methodLog("Dwumian utworzony na podstawie pierwiastka x = " + xValue, true, true);
                methodLog(a.toHTMLStringBackward());
                methodLog("Wielomian utworzony przez podzielenie wielomianu " + pol.toHTMLStringBackward() + " przez wielomian " + a.toHTMLStringBackward(), true, true);
                methodLog(b.toHTMLStringBackward());
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
            let nrOfAllCases = 1;
            for (let i = 0; i < matrixOfDivisors.length; i++)
            {
                Ls.push(matrixOfDivisors[i].length);
                nrOfAllCases *= matrixOfDivisors[i].length;
            }

            console.log("Nr of all cases: " + nrOfAllCases + " for " + pol.toStringBackward());

            let customNr = new CustomNrSystem(Ls,0);
            let customOne = new CustomNrSystem(Ls,1);

            do
            {
                console.log("custom nr = " + customNr.toDecNr());
                for (let i = 0; i < X.length; i++)
                {
                    Y[i] = matrixOfDivisors[i][customNr.getNr()[i]]; //setting y values according to custom nr
                }

                methodLog("Mamy następujące argumenty, które użyjemy do interpolacji: ", true, false);
                methodLog("X = ", true, false);
                for (let i = 0; i < X.length; i++)
                {
                    methodLog(X[i] + "; ", false, false);
                }
                methodLog("", false, true);

                methodLog("Wybieramy ze zbioru dzielników następujące wartości: ");
                methodLog("Y = ", false, false);
                for (let i = 0; i < X.length; i++)
                {
                    methodLog(Y[i] + "; ", false, false);
                }
                methodLog("", false, true);

                a = lagrangeInterpolationPolynomial(Math.round(degree/2),X,Y);
                methodLog("Następnie po interpolacji dla tych punktów otrzymaliśmy następujący wielomian: ");
                methodLog(a.toHTMLStringBackward());

                //divide main polynomial by found polynomial
                b = pol.divide(a);

                if(isMemberOfPolynomials(a))
                {
                    methodLog("Wielomian " + a.toHTMLStringBackward() + " już był ");
                }
                else if((a.getDegree() === 0 && a.coefficients[0] === 1) || (a.getDegree() === 0 && a.coefficients[0] === -1))
                {
                    methodLog("Wielomian " + a.toHTMLStringBackward()
                        + " nie zmienia wiele, więc go ignorujemy i szukamy dalej kolejnego zestawu dzielników");
                }
                else if(!a.hasOnlyIntegerCoefficients())
                {
                    methodLog("Wielomian " + a.toHTMLStringBackward() + " ma niecałkowite współczynniki ");
                }
                else if(!b.hasOnlyIntegerCoefficients())
                {

                    methodLog("Wielomian utworzony przez podzielenie wielomianu " + pol.toHTMLStringBackward() + " przez wielomian " + a.toHTMLStringBackward(), true, true);
                    methodLog(b.toHTMLStringBackward());
                    methodLog("Wielomian " + b.toHTMLStringBackward() + " ma niecałkowite współczynniki"+ ", więc szukamy dalej dla kolejnego zestawu dzielników");
                }
                else if(b.getDegree() >= 0 && a.hasOnlyIntegerCoefficients() && b.hasOnlyIntegerCoefficients())
                {
                    methodLog("Wielomian utworzony przez podzielenie wielomianu " + pol.toHTMLStringBackward() + " przez wielomian " + a.toHTMLStringBackward(), true, true);
                    methodLog(b.toHTMLStringBackward());
                    toFactorize = true;
                    break;
                }
                else
                {
                    methodLog("Wielomian " + pol.toHTMLStringBackward() + " nie jest podzielny przez " + a.toHTMLStringBackward()
                        + ", więc szukamy dalej dla kolejnego zestawu dzielników");
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

    methodLog("Wielomian, który teraz sfaktoryzujemy to: ");
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

    let nrOfPoints = (Math.floor(degree/2) + 1) + 1; //degree of a + 1
    let points = getBestPointsSeparatedByEqualIntervals(nrOfPoints, pol);

    for (let i = 0; i < nrOfPoints; i++)
    {
        xValue = points[0][i];
        X.push(xValue);
        yValue = points[1][i];
        Y.push(yValue);

        if(yValue === 0) //if root found
        {
            methodLog("Przypadkowo znaleźliśmy pierwiastek f(" + xValue + ") = " + yValue);
            a = new Polynomial([-1*xValue, 1]);
            methodLog("Dwumian utworzony na podstawie pierwiastka x = " + xValue, true, true);
            methodLog(a.toHTMLStringBackward());

            if(isMoved)
            {
                methodLog("Dwumian " + a.toHTMLStringBackward() + " dzieli wielomian " + pol.toHTMLStringBackward(), true, true);
                methodLog("Dwumian " + a.toHTMLStringBackward() + " przesunięty z powrotem w niestabilne miejsce ", true, false);
                a = a.getPolynomialMovedByVector([(m+1),0]);
                methodLog(a.toHTMLStringBackward(), false, true);
                pol = pol.getPolynomialMovedByVector([(m+1),0]);
                isMoved = false;
            }

            b = pol.divide(a);

            rootFound = true;


            methodLog("Wielomian utworzony przez podzielenie wielomianu " + pol.toHTMLStringBackward() + " przez wielomian " + a.toHTMLStringBackward(), true, true);
            methodLog(b.toHTMLStringBackward());

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
        let degrees = [];
        //find polynomial by points
        let interY = new Array(X.length);

        // getting lengths in matrixOfDivisors
        let Ls = new Array(0);
        let nrOfAllCases = 1;
        for (let i = 0; i < matrixOfDivisors.length; i++)
        {
            Ls.push(matrixOfDivisors[i].length);
            nrOfAllCases *= matrixOfDivisors[i].length;
        }

        console.log("Nr of all cases: " + nrOfAllCases + " for " + pol.toStringBackward());

        let customNr = new CustomNrSystem(Ls,0);
        let customOne = new CustomNrSystem(Ls,1);

        do
        {
            console.log("custom nr = " + customNr.toDecNr());
            for (let i = 0; i < X.length; i++)
            {
                interY[i] = matrixOfDivisors[i][customNr.getNr()[i]]; //setting y values according to custom nr
            }

            methodLog("Mamy następujące argumenty, które użyjemy do interpolacji: ", true, false);
            methodLog("X = ", true, false);
            for (let i = 0; i < X.length; i++)
            {
                methodLog(X[i] + "; ", false, false);
            }
            methodLog("", false, true);

            methodLog("Wybieramy ze zbioru dzielników następujące wartości: ");
            methodLog("Y = ", false, false);
            for (let i = 0; i < X.length; i++)
            {
                methodLog(interY[i] + "; ", false, false);
            }
            methodLog("", false, true);

            degrees = getDegreesOfProducts(Y,interY);

            if(degrees[0] + degrees[1] !== degree || degrees[0] < 0 || degrees[1] < 0)
            {
                methodLog("Powyższy zestaw dzielników należy pominąć");
                console.log("custom nr = " + customNr.toDecNr());
                customNr = customNr.add(customOne);
                continue;
            }

            a = newtonInterpolationPolynomial(degrees[0],X,interY);
            methodLog("Wielomian " + a.toHTMLStringBackward() + " dzieli wielomian " + pol.toHTMLStringBackward(), true, true);

            if(isMoved)
            {
                methodLog("Wielomian " + a.toHTMLStringBackward() + " przesunięty z powrotem w niestabilne miejsce ", true, false);
                a = a.getPolynomialMovedByVector([(m+1),0]);
                methodLog(a.toHTMLStringBackward(), false, true);
                pol = pol.getPolynomialMovedByVector([(m+1),0]);
                isMoved = false;
            }


            //divide main polynomial by found polynomial
            b = pol.divide(a);

            if(isMemberOfPolynomials(a))
            {
                methodLog("Wielomian " + a.toHTMLStringBackward() + " już był ");
            }
            else if((a.getDegree() === 0 && a.coefficients[0] === 1) || (a.getDegree() === 0 && a.coefficients[0] === -1))
            {
                methodLog("Wielomian " + a.toHTMLStringBackward() + " jest pozbawiony sensu ");
            }
            else if(!a.hasOnlyIntegerCoefficients())
            {
                methodLog("Wielomian " + a.toHTMLStringBackward() + " ma niecałkowite współczynniki ");
            }
            else if(!b.hasOnlyIntegerCoefficients())
            {
                methodLog("Wielomian powstały przez podzielenie wielomianu " + pol.toHTMLStringBackward() + " przez wielomian " + b.toHTMLStringBackward());
                methodLog(b.toHTMLStringBackward());
                methodLog("Wielomian " + b.toHTMLStringBackward() + " ma niecałkowite współczynniki ");
            }
            else if(b.getDegree() >= 0 && a.hasOnlyIntegerCoefficients() && b.hasOnlyIntegerCoefficients())
            {
                methodLog("Wielomian powstały przez podzielenie wielomianu " + pol.toHTMLStringBackward() + " przez wielomian " + b.toHTMLStringBackward());
                methodLog(b.toHTMLStringBackward());
                if(isMoved)
                {
                    methodLog("Wielomian " + b.toHTMLStringBackward() + " przesunięty z powrotem = " + b.getPolynomialMovedByVector([(m+1),0]).toHTMLStringBackward());
                }

                toFactorize = true;
                break;
            }
            else
            {
                methodLog("Wielomian " + pol.toHTMLStringBackward() + " nie jest podzielny przez wielomian " + a.toHTMLStringBackward());
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

function getDegreesOfProducts(a,b)
{
    //a_i=b_i*c_i
    let c = getSequencesOfDivisors(a,b)[1];

    let bIncreasing = isIncreasingSequence(b);
    let cIncreasing = isIncreasingSequence(c);

    let deg1 = 0;
    let deg2 = 0;

    methodLog("Wartości a = " + JSON.stringify(a), true, false);
    methodLog("Dzielniki b = " + JSON.stringify(b), true, false);
    methodLog("Dzielniki c = " + JSON.stringify(c), true, true);


    if( !bIncreasing )
    {
        methodLog("Widać, że wartości b nie rosną b = " + JSON.stringify(b), true, true);
        return [b.length,-1];
    }

    if( !cIncreasing )
    {
        methodLog("Widać, że wartości c nie rosną c = " + JSON.stringify(c), true, true);
        return [-1,c.length];
    }

    let bDifferenceTable = getDifferenceTable(b);
    let cDifferenceTable = getDifferenceTable(c);

    deg1 = bDifferenceTable.length - 1;
    deg2 = cDifferenceTable.length - 1;

    methodLog("Tablica różnicowa dla b: ",true, true);
    for (let i = 0; i < bDifferenceTable.length; i++)
    {
        methodLog(JSON.stringify(bDifferenceTable[i]).replaceAll(",",";"),false, true);
    }
    methodLog("Stopień potencjalnego dzielnika: " + deg1);

    methodLog("Tablica różnicowa dla c: ",true, true);
    for (let i = 0; i < cDifferenceTable.length; i++)
    {
        methodLog(JSON.stringify(cDifferenceTable[i]).replaceAll(",",";"),false, true);
    }
    methodLog("Stopień potencjalnego drugiego dzielnika: " + deg1);

    let newB = bDifferenceTable[bDifferenceTable.length - 1];
    let theSameNrsInB = areAllElementsEqual(newB);

    let newC = cDifferenceTable[cDifferenceTable.length - 1];
    let theSameNrsInC = areAllElementsEqual(newC);

    return [deg1, deg2]; //if not constant sequences return skip = true
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
    let areTheSameInRow = true;
    let firstInRow = seq[0];

    for (let i = 0; i < seq.length; i++)
    {
        if(i == 0)
        {
            componentsTable.push(seq);
        }
        else
        {
            componentsTable.push(diff(componentsTable[i-1]));
        }

        firstInRow = componentsTable[i][0];
        areTheSameInRow = true;
        for (let j = 1; j < componentsTable[i].length; j++)
        {
            if(componentsTable[i][j] != firstInRow)
            {
                areTheSameInRow = false;
            }
        }

        if(areTheSameInRow)
        {
            break;
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

    for (let i = -4 * nrOfPoints; i < 4 * nrOfPoints; i++)
    {
        let x = i;
        let y = pol.f(x);
        let nrOfDivisors;

        if (y === 0)
        {
            nrOfDivisors = 0;
        }
        else
        {
            nrOfDivisors = findDivisors(y).length;
        }

        combinedArray.push({x: x, y: y, nrOfDivisors: nrOfDivisors});
    }

    combinedArray.sort((a, b) => a.nrOfDivisors - b.nrOfDivisors);

    // Cut the array to the required number of points
    combinedArray = combinedArray.slice(0, nrOfPoints);

    combinedArray.sort((a, b) => a.x - b.x);

    for (let i = 0; i < nrOfPoints; i++)
    {
        X.push(combinedArray[i].x);
        Y.push(combinedArray[i].y);
    }

    return [X, Y];
}

function getBestPointsSeparatedByEqualIntervals(nrOfPoints, pol)
{
    let X = [];
    let Y = [];
    let nrOfAllDivisors = 999999999;
    let Xbest = [];
    let Ybest = [];
    let nrOfAllBestDivisors = 999999999;

    let x,y;

    let rootFound = false;

    for (let j = 1; j <= 55; j++)
    {
        nrOfAllDivisors = 0;
        X = [];
        Y = [];

        for (let i = 0; i < nrOfPoints; i++)
        {
            x = i - nrOfPoints + j;
            y = pol.f(x);
            if(y == 0)
            {
                rootFound = true;
            }

            X.push(x);
            Y.push(y);
            nrOfAllDivisors += findDivisors(y).length;
        }

        if (rootFound)
        {
            return [X,Y]
        }

        if(nrOfAllDivisors < nrOfAllBestDivisors)
        {
            Xbest = JSON.parse(JSON.stringify(X));
            Ybest = JSON.parse(JSON.stringify(Y));
            nrOfAllBestDivisors = JSON.parse(JSON.stringify(nrOfAllDivisors));
        }
    }
    return [Xbest,Ybest];
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

    return new Matrix(matHelp).transpose();
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
    let mat;
    for (let i = 1; i < pol.coefficients.length; i++)
    {
        mat = getMatrixOfCoefficients(pol.coefficients,i);
        det = mat.det();

        if(i % 2 == 0)
        {
            methodLog("W<sub>" + i + "</sub> = ", true, false);
            methodLog(mat.toHTMLString(true), true, false);
            methodLog(" = " + det, true, false);

            if(det < 0)
            {
                methodLog(" < 0", false, true);
            }
            else if(det > 0)
            {
                methodLog(" > 0", false, true);
            }

            if(det < 0) //if different sign or a_i smaller than a_i-1
            {
                methodLog("Wyznacznik ujemny", true, false);
                return false; //polynomial is not stable by Hurwitz
            }

            if(det === 0) //if different sign or a_i smaller than a_i-1
            {
                methodLog("Jeden z wyznaczników równy zero", true, true);
                return false; //polynomial is not stable by Hurwitz
            }
        }
        else
        {
            methodLog("W<sub>" + i + "</sub> * a<sub>0</sub> = ", true, false);
            methodLog(mat.toHTMLString(true), false, false);
            methodLog(" * " + pol.coefficients[0] + " = " + det + " * " + pol.coefficients[0] + " = "
                + (det * pol.coefficients[0]), true, false);

            if((det * pol.coefficients[0]) < 0)
            {
                methodLog(" < 0", false, true);
            }
            else if((det * pol.coefficients[0]) > 0)
            {
                methodLog(" > 0", false, true);
            }

            if(pol.coefficients[0] * det < 0) //if different sign or a_i smaller than a_i-1
            {
                methodLog("Iloczyn wyznacznika i współczynnika jest ujemny", true, true);
                return false; //polynomial is not stable by Hurwitz
            }

            if(pol.coefficients[0] * det === 0) //if different sign or a_i smaller than a_i-1
            {
                methodLog("Wyznacznik równy zero", true, true);
                return false; //polynomial is not stable by Hurwitz
            }
        }
    }

    return true;
}

function methodLog(text, startNewLine = false, endNewLine = true)
{
    if(startNewLine)
    {
        document.getElementById("methodsContent").innerHTML += "<br>";
    }
    document.getElementById("methodsContent").innerHTML += text.toString();

    if(endNewLine)
    {
        document.getElementById("methodsContent").innerHTML += "<br>";
    }
}

function clearMethodLogs()
{
    document.getElementById("methodsContent").innerHTML = "";
}
