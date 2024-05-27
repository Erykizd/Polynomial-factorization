class Polynomial
{
    coefficients = [];

    constructor(coefficients = [])
    {
        this.coefficients = JSON.parse(JSON.stringify(coefficients));
    }

    add(b)
    {
        let a = this;
        let c;
        if(typeof(b) == 'number')
        {
            c = new Polynomial(a.coefficients);
            c.coefficients[0] += b;
            return c;
        }

        let deg1 = a.coefficients.length - 1;
        let deg2 = b.coefficients.length - 1;
        c = new Polynomial(new Array(Math.max(deg1, deg2) + 1).fill(0));

        let i = 0;
        for (i = 0; i < Math.min(deg1, deg2) + 1; i++)
        {
            c.coefficients[i] = a.coefficients[i] + b.coefficients[i]
        }

        for (i; i < Math.max(deg1, deg2) + 1; i++)
        {
            if(a.coefficients.length > b.coefficients.length)
            {
                c.coefficients[i] = a.coefficients[i];
            }
            else
            {
                c.coefficients[i] = b.coefficients[i]
            }
        }

        return c;
    }

    subtract(b)
    {
        let a = this;
        let c;

        if(typeof(b) == 'number')
        {
            c = new Polynomial(a.coefficients);
            c.coefficients[0] -= b;
            return c;
        }

        let h = b.multiply(new Polynomial([-1]));
        c = new Polynomial(new Array(Math.max(a.coefficients.length, h.coefficients.length)).fill(0));

        for (let i = 0; i < c.coefficients.length; i++)
        {
            c.coefficients[i] = a.coefficients[i] + h.coefficients[i];
        }

        return c;
    }

    multiply(b)
    {
        let a = this;
        let c;

        if(typeof(b) == 'number')
        {
            c = new Polynomial(a.coefficients);
            for (let i = 0; i < c.coefficients.length; i++)
            {
                c.coefficients[i] *= b;
            }
            return c;
        }

        let deg1 = a.coefficients.length - 1;
        let deg2 = b.coefficients.length - 1;
        c = new Polynomial(new Array(deg1 + deg2 + 1).fill(0));

        for (let i = 0; i < a.coefficients.length; i++)
        {
            for (let j = 0; j < b.coefficients.length; j++)
            {
                c.coefficients[i + j] += a.coefficients[i] * b.coefficients[j];
            }
        }

        return c;
    }

    power(n)
    {
        let a = this;
        let c = new Polynomial([1]);

        if(typeof(n) !== 'number')
        {
            return a;
        }

        for (let i = 0; i < n; i++)
        {
            c = c.multiply(a);
        }

        return c;
    }

    divide(b)
    {
        let a = this;
        let c;

        if(typeof(b) == 'number')
        {
            c = new Polynomial(a.coefficients);
            for (let i = 0; i < c.coefficients.length; i++)
            {
                c.coefficients[i] /= b;
            }
            return c;
        }

        let deg1 = a.coefficients.length - 1;
        let deg2 = b.coefficients.length - 1;
        const deg3 = deg1 - deg2;
        let r = new Polynomial([...a.coefficients]); // Deep copy of polynomial a
        c = new Polynomial(new Array(deg3 + 1).fill(0));
        let divisor = b.coefficients[deg2]; // Leading coefficient of b
        let term;
        let product;
        let z = new Polynomial([1]);

        for (let i = 0; i <= deg3; i++)
        {
            if (divisor === 0)
            {
                throw new Error("Division by zero");
            }

            c.coefficients[deg3 - i] = r.coefficients[deg1 - i] / divisor; //setting next word in score
            term = z.zerosAndOne(deg3, deg3 - i);
            term = term.multiply(c.coefficients[deg3 - i]);
            product = term.multiply(b);
            r = r.subtract(product);
        }

        for (let i = 0; i < r.coefficients.length; i++)
        {
            if(r.coefficients[i] !== 0) //if the remainder has at least one not zero coefficient
            {
                c.coefficients = []; //clear score because there was not zero remainder
            }
        }

        // Trim leading zeros in the result
        while (c.coefficients.length > 1 && c.coefficients[c.coefficients.length - 1] === 0)
        {
            c.coefficients.pop();
        }

        return c;
    }

    isEqual(pol)
    {
        return JSON.stringify(this) === JSON.stringify(pol);
    }


    getPolynomialMovedByVector(vec)
    {
        if(vec.length < 2)
        {
            return this;
        }

        let component;
        let ret = new Polynomial([0]);

        for (let i = 0; i < this.coefficients.length; i++)
        {
            component = new Polynomial([0,1]); // 0 + 1x
            component = component.add(-vec[0]);
            component = component.power(i); //(x-vx)^i
            component = component.multiply(this.coefficients[i]) // * a_i

            ret = ret.add(component);
        }

        ret = ret.add(vec[1]); // + vy

        for (let i = 0; i < this.coefficients.length; i++)
        {
            ret.coefficients[i] = Math.round(ret.coefficients[i] * 1000000) / 1000000;
        }

        return ret;
    }

    toHTMLString()
    {
        let str = "";

        for (let i = 0; i < this.coefficients.length; i++)
        {
            if(this.coefficients[i] !== 0)
            {
                str += " + ";
                str += this.coefficients[i];
                str += "x<sup>" + i + "</sup>";
            }
        }

        str = this.correctPolynomialString(str);

        return str;
    }

    toHTMLStringBackward()
    {
        let str = "";

        for (let i = this.coefficients.length - 1; i >= 0; i--)
        {
            if(this.coefficients[i] != 0)
            {
                str += " + ";
                str += this.coefficients[i];
                str += "x<sup>" + i + "</sup>";
            }
        }

        str = this.correctPolynomialString(str);

        return str;
    }

    toString()
    {
        let str = "";

        for (let i = 0; i < this.coefficients.length; i++)
        {
            if(this.coefficients[i] != 0)
            {
                str += " + ";
                str += this.coefficients[i];
                str += "x^" + i;
            }
        }

        str = this.correctPolynomialString(str);

        return str;
    }

    toStringBackward()
    {
        let str = "";

        for (let i = this.coefficients.length - 1; i >= 0; i--)
        {
            if(this.coefficients[i] != 0)
            {
                str += " + ";
                str += this.coefficients[i];
                str += "x^" + i;
            }
        }

        str = this.correctPolynomialString(str);

        return str;
    }

    correctPolynomialString(str)
    {
        str = str.replaceAll("x^1 ","x ");
        if(str.endsWith("x^1"))
        {
            str = str.replaceAll("x^1","x");
        }
        str = str.replaceAll("x<sup>0</sup>","");
        str = str.replaceAll("x<sup>1</sup>","x");
        str = str.replaceAll("x^0","");
        str = str.replaceAll(" 1x"," x");
        str = str.replaceAll("--","+");
        str = str.replaceAll("+ -","- ");
        str = str.replaceAll(" 1x"," x");

        if(str.startsWith(" + "))
        {
            str = str.replace(" + ", "");
        }
        else if(str.startsWith(" - "))
        {
            str = str.replace(" - ", "-");
        }

        return str;
    }

    zerosAndOne(deg, oneIndex)
    {
        let pol = new Polynomial(Array(deg + 1));

        for (let i = 0; i <= deg; i++)
        {
            if (i == oneIndex)
            {
                pol.coefficients[i] = 1;
            }
            else
            {
                pol.coefficients[i] = 0;
            }
        }

        return pol;
    }

    f(x)
    {
        let sum = 0;
        for (let i = 0; i < this.coefficients.length; i++)
        {
            sum += this.coefficients[i] * Math.pow(x,i);
        }
        return sum;
    }

    display()
    {
        if(this.coefficients.length == 0)
        {
            console.log("Wrong polynomial");
            return;
        }
        console.log(this.toString());
    }

    getDegree()
    {
        return this.coefficients.length - 1;
    }

    hasOnlyIntegerCoefficients()
    {
        for (let i = 0; i < this.coefficients.length; i++)
        {
            if(this.coefficients[i] % 1 !== 0) //if is coefficients[i] is not an integer
            {
                return false;
            }
        }
        return true;
    }
}
