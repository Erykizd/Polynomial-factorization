class Matrix
{
    constructor(Mat)
    {
        if(typeof(Mat) === "string")
        {
            this.Mat = [new Array(0)];
        }
        else if(typeof(Mat) === "number")
        {
            this.Mat = [[Mat]];
        }
        else if(typeof(Mat[0]) === "number") // if Mat is a vector
        {
            this.Mat = [JSON.parse(JSON.stringify(Mat))];
        }
        else if(typeof(Mat[0]) === "object" && Mat[0].length !== undefined) // if Mat is a vector
        {
            this.Mat = JSON.parse(JSON.stringify(Mat));
        }
    }

    getMat()
    {
        return this.Mat;
    }

    setMat(Mat)
    {
        this.Mat = Mat;
    }

    zeros(imax, jmax)
    {
        this.Mat = [];
        for (let i = 0; i < imax; i++)
        {
            let row = [];
            for (let j = 0; j < jmax; j++)
            {
                row.push(0.0);
            }
            this.Mat.push(row);
        }
    }

    ones(imax, jmax)
    {
        let matHelp = [];
        for (let i = 0; i < imax; i++)
        {
            let row = [];
            for (let j = 0; j < jmax; j++)
            {
                row.push(1.0);
            }
            matHelp.push(row);
        }

        return new Matrix(matHelp);
    }

    eye(imax)
    {
        let matHelp = [];
        for (let i = 0; i < imax; i++)
        {
            let row = [];
            for (let j = 0; j < imax; j++)
            {
                if(i === j)
                {
                    row.push(1.0);
                }
                else
                {
                    row.push(0.0);
                }
            }
            matHelp.push(row);
        }

        return new Matrix(matHelp);
    }

    fillWithNr(nr, imax, jmax)
    {
        this.Mat = [];
        for (let i = 0; i < imax; i++)
        {
            let row = [];
            for (let j = 0; j < jmax; j++)
            {
                row.push(nr);
            }
            this.Mat.push(row);
        }
    }

    fillDiagonalWithNrs(nrs)
    {
        this.Mat = [];
        for (let i = 0; i < nrs.length; i++)
        {
            let row = [];
            for (let j = 0; j < nrs.length; j++)
            {
                if (i === j)
                {
                    row.push(nrs[j]);
                }
                else
                {
                    row.push(0);
                }
            }
            this.Mat.push(row);
        }
    }

    setCell(value, i, j)
    {
        this.Mat[i][j] = value;
    }

    display()
    {
        for (let i = 0; i < this.Mat.length; i++)
        {
            let rowStr = "\t";
            for (let j = 0; j < this.Mat[0].length; j++)
            {
                rowStr += this.Mat[i][j] + "\t";
            }
            console.log(rowStr);
        }
        console.log();
    }

    add(MatIn)
    {
        if (this.Mat.length !== MatIn.getMat().length || this.Mat[0].length !== MatIn.getMat()[0].length)
        {
            throw new Error("Matrices's dimensions are not equal");
        }
        const MatHelp = [];
        for (let i = 0; i < this.Mat.length; i++)
        {
            let row = [];
            for (let j = 0; j < this.Mat[0].length; j++)
            {
                row.push(this.Mat[i][j] + MatIn.getMat()[i][j]);
            }
            MatHelp.push(row);
        }
        return new Matrix(MatHelp);
    }

    subtract(MatIn)
    {
        if (this.Mat.length !== MatIn.getMat().length || this.Mat[0].length !== MatIn.getMat()[0].length)
        {
            throw new Error("Matrices's dimensions are not equal");
        }
        const MatHelp = [];
        for (let i = 0; i < this.Mat.length; i++)
        {
            let row = [];
            for (let j = 0; j < this.Mat[0].length; j++)
            {
                row.push(this.Mat[i][j] - MatIn.getMat()[i][j]);
            }
            MatHelp.push(row);
        }
        return new Matrix(MatHelp);
    }

    multiply(MatIn) {
        if (typeof MatIn === "number") {
            const MatHelp = JSON.parse(JSON.stringify(this.Mat));
            for (let i = 0; i < this.Mat.length; i++) {
                for (let j = 0; j < this.Mat[i].length; j++) {
                    MatHelp[i][j] *= MatIn;
                }
            }
            return new Matrix(MatHelp);
        }

        if (this.Mat[0].length !== MatIn.getMat().length)
        {
            throw new Error("Nr of columns of first matrix and nr of rows of second matrix aren't equal");
        }

        const MatHelp = new Array(this.Mat.length).fill(null).map(() => new Array(MatIn.getMat()[0].length).fill(0));

        for (let i = 0; i < this.Mat.length; i++)
        {
            for (let j = 0; j < MatIn.getMat()[0].length; j++)
            {
                let value = 0.0;
                for (let k = 0; k < this.Mat[0].length; k++)
                {
                    value += this.Mat[i][k] * MatIn.getMat()[k][j];
                }
                MatHelp[i][j] = value;
            }
        }
        return new Matrix(MatHelp);
    }

    toPowerOf(n)
    {
        let ret = JSON.parse(JSON.stringify(this));
        if(n < 0)
        {
            ret = ret.inverse();
        }

        if(n === 0)
        {
            return ret.eye(ret.Mat.length);
        }

        if(n === 1)
        {
            return ret;
        }

        for (let i = 1; i < Math.abs(n); i++)
        {
            ret = ret.multiply(ret);
        }

        return ret;
    }

    transpose()
    {
        const transposedMatrix = [];
        const rows = this.Mat.length;
        const cols = this.Mat[0].length;

        for (let j = 0; j < cols; j++)
        {
            const newRow = [];
            for (let i = 0; i < rows; i++)
            {
                newRow.push(this.Mat[i][j]);
            }
            transposedMatrix.push(newRow);
        }

        return new Matrix(transposedMatrix);
    }

    det()
    {
        if (this.Mat.length !== this.Mat[0].length)
        {
            throw new Error("Matrix must be square");
        }

        const n = this.Mat.length;

        if (n === 1)
        {
            return this.Mat[0][0];
        }

        if (n === 2)
        {
            return this.Mat[0][0] * this.Mat[1][1] - this.Mat[0][1] * this.Mat[1][0];
        }

        let determinant = 0;
        for (let j = 0; j < n; j++)
        {
            determinant += ((j % 2 === 0 ? 1 : -1) * this.Mat[0][j] * this.minor(0, j).det());
        }

        return determinant;
    }

    minor(row, col)
    {
        const minorMatrix = [];

        for (let i = 0; i < this.Mat.length; i++)
        {
            if (i === row) continue;
            const newRow = [];

            for (let j = 0; j < this.Mat[i].length; j++)
            {
                if (j === col) continue;
                newRow.push(this.Mat[i][j]);
            }

            minorMatrix.push(newRow);
        }

        return new Matrix(minorMatrix);
    }

    inverse()
    {
        const n = this.Mat.length;
        if (n !== this.Mat[0].length)
        {
            throw new Error("Matrix must be square");
        }

        const det = this.det();
        if (det === 0)
        {
            throw new Error("Matrix is not invertible");
        }

        const cofactors = [];
        for (let i = 0; i < n; i++)
        {
            const cofactorRow = [];
            for (let j = 0; j < n; j++)
            {
                const minor = this.minor(i, j);
                const cofactor = ((i + j) % 2 === 0 ? 1 : -1) * minor.det();
                cofactorRow.push(cofactor);
            }
            cofactors.push(cofactorRow);
        }

        const cofactorMatrix = new Matrix(cofactors);
        const adjugateMatrix = cofactorMatrix.transpose();

        const inversedMatrix = adjugateMatrix.multiply(1 / det);

        return inversedMatrix;
    }

    toString(displayAsDet = false)
    {
        let str = "";

        for (let i = 0; i < this.Mat.length; i++)
        {
            if(i === 0 && !displayAsDet)
            {
                str += "┌ ";
            }
            else if(i === this.Mat.length - 1  && !displayAsDet)
            {
                str += "└ "
            }
            else
            {
                str += "| ";
            }

            for (let j = 0; j < this.Mat[i].length; j++)
            {
                str += (this.Mat[i][j] + " ");
            }

            if(i === 0 && !displayAsDet)
            {
                str += "┐";
            }
            else if(i === this.Mat.length - 1 && !displayAsDet)
            {
                str += "┘"
            }
            else
            {
                str += "|";
            }

            str += "\n";
        }
        return str;
    }

    toHTMLString(displayAsDet = false)
    {
        let div = document.createElement("div");
        let table = document.createElement("table");
        let tbody = document.createElement("tbody");
        let tr;
        let td;
        table.classList.add("matrix");

        for (let i = 0; i < this.Mat.length; i++)
        {
            tr = document.createElement("tr");
            for (let j = 0; j < this.Mat[i].length; j++)
            {
                td = document.createElement("td");
                td.innerHTML = this.Mat[i][j];

                if (j === 0)
                {
                    td.classList.add("left");
                }

                if (j === this.Mat[i].length - 1)
                {
                    td.classList.add("right");
                }

                if (!displayAsDet)
                {
                    if(i === 0 && j === 0)
                    {
                        td.classList.add("top");
                    }

                    if(i === 0 && j === this.Mat[i].length - 1)
                    {
                        td.classList.add("top");
                    }

                    if(i === this.Mat.length - 1 && j === 0)
                    {
                        td.classList.add("bottom");
                    }

                    if(i === this.Mat.length - 1 && j === this.Mat[i].length - 1)
                    {
                        td.classList.add("bottom");
                    }
                }

                tr.appendChild(td);
            }
            tbody.appendChild(tr);
        }
        table.appendChild(tbody);
        div.appendChild(table);
        return div.outerHTML;
    }
}
