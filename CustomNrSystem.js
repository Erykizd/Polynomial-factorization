class CustomNrSystem
{
    constructor(lengths, value)
    {
        this.Ls = lengths.slice();
        this.nr = new Array(lengths.length).fill(0);

        if (Array.isArray(value))
        {
            let valueToNext = 0;
            for (let i = this.Ls.length - 1; i >= 0; i--)
            {
                this.nr[i] += value[i] + valueToNext;
                valueToNext = Math.floor(this.nr[i] / this.Ls[i]);
                this.nr[i] %= this.Ls[i];
            }
        }
        else if (typeof value === 'number')
        {
            let valueToNext = value;
            for (let i = this.Ls.length - 1; i >= 0; i--)
            {
                this.nr[i] += valueToNext;
                valueToNext = Math.floor(this.nr[i] / this.Ls[i]);
                this.nr[i] %= this.Ls[i];
            }
        }
    }

    add(otherNr)
    {
        const newNr = this.nr.slice();
        let valueToNext = 0;
        for (let i = this.Ls.length - 1; i >= 0; i--)
        {
            newNr[i] += otherNr.nr[i] + valueToNext;
            valueToNext = Math.floor(newNr[i] / this.Ls[i]);
            newNr[i] %= this.Ls[i];
        }
        return new CustomNrSystem(this.Ls, newNr);
    }

    subtract(otherNr)
    {
        const newNr = this.nr.slice();
        let valueToNext = 0;
        for (let i = this.Ls.length - 1; i >= 0; i--)
        {
            newNr[i] -= otherNr.nr[i] + valueToNext;
            valueToNext = 0;
            while (newNr[i] < 0)
            {
                newNr[i] += this.Ls[i];
                valueToNext++;
            }
        }
        return new CustomNrSystem(this.Ls, newNr);
    }

    getNr()
    {
        return this.nr.slice();
    }

    toString()
    {
        let returnNrStr = "";
        for (let i = 0; i < this.Ls.length; i++)
        {
            let addStr = "";
            if (this.nr[i] > 9)
            {
                addStr = String.fromCharCode('A'.charCodeAt(0) + (this.nr[i] - 10));
            }
            else
            {
                addStr = String(this.nr[i]);
            }
            returnNrStr += addStr;
        }
        return returnNrStr;
    }

    toDecNr()
    {
        let returnNrDec = 0;
        let multiplicator = 1;
        for (let i = this.Ls.length - 1; i >= 0; i--)
        {
            returnNrDec += this.nr[i] * multiplicator;
            multiplicator *= this.Ls[i];
        }
        return returnNrDec;
    }
}
