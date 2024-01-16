class MathUtil {


    /**
     * 计算阶乘值
     *
     * @static
     * @param {*} value
     * @return {*} 
     * @memberof MathUtil
     */
    static Factorial(value) {
        if (value == 0 || value == 1)
            return 1;
        else
            return value * this.Factorial(value - 1);
    }


    static Distance(p1, p2) {
        return Math.sqrt(Math.pow(p1[0] - p2[0], 2) + Math.pow(p1[1] - p2[1], 2), p1.length > 2 ? Math.pow(p1[2] - p2[2], 2) : 0);
    }



    /**
     * 获取p1、p2中点
     *
     * @static
     * @param {*} p1
     * @param {*} p2
     * @return {*} 
     * @memberof MathUtil
     */
    static MidPoint(p1, p2) {
        let p = []
        for (let i = 0; i < p1.length; i++) {
            p.push((p1[i] + p2[i]) / 2);
        }
        return p;
    }



    /**
     * 获取p1-p2延长线上点
     *
     * @static
     * @param {*} p1
     * @param {*} p2
     * @param {*} k 基于p2-p1坐标差的系数
     * @return {*} 
     * @memberof MathUtil
     */
    static PointOnExtendedLine(p1, p2, k) {
        let p = []
        for (let i = 0; i < p1.length; i++) {
            p.push(p2[i] + k * (p2[i] - p1[i]));
        }
        return p;
    }


    /**
     *  获取角p1p3p2 的角平分线在p1-p2上的交点
     *
     * @static
     * @param {*} p1
     * @param {*} p2
     * @param {*} p3
     * @memberof MathUtil
     */
    static BiSectorPoint(p1, p2, p3) {
        let dis13, dis23, t, p = [];
        dis13 = this.Distance(p1, p3);
        dis23 = this.Distance(p2, p3);
        t = dis13 / (dis13 + dis23);
        for (let j = 0; j < p1.length; j++) {
            p.push(p1[j] * (1 - t) + p2[j] * t)
        }
        return p;
    }



    /**
     * 获取二阶贝塞尔曲线点集
     *
     * @static
     * @param {*} p1
     * @param {*} p2
     * @param {*} p3
     * @param {*} count
     * @return {*} 
     * @memberof MathUtil
     */
    static BesselSquarePoints(p1, p2, p3, count) {
        let A, B, C, step, p, result = [];
        step = 1 / count;
        p = [0, 0];
        if (p1.length > 2) p.push(0);

        for (let t = 0; t < 1; t += step) {
            A = Math.pow(1 - t, 2);
            B = 2 * t * (1 - t);
            C = t * t;
            for (let j = 0; j < p1.length; j++) {
                p[j] = A * p1[j] + B * p2[j] + C * p3[j];
            }
            result.push([...p]);
        }
        return result;
    }


    /**
     * 计算 三阶贝塞尔点集
     *
     * @static
     * @param {*} p1
     * @param {*} p2
     * @param {*} p3
     * @param {*} p4
     * @param {*} count
     * @return {*} 
     * @memberof MathUtil
     */
    static BesselCubicPoints(p1, p2, p3, p4, count) {
        let A, B, C, D, step, p, result = [];
        step = 1 / count;
        p = [0, 0];
        if (p1.length > 2) p.push(0);
        for (let t = 0; t < 1; t += step) {
            A = Math.pow(1 - t, 3);
            B = 3 * t * Math.pow(1 - t, 2);
            C = 3 * t * t * (1 - t);
            D = Math.pow(t, 3);

            for (let j = 0; j < p1.length; j++) {
                p[j] = A * p1[j] + B * p2[j] + C * p3[j] + D * p4[j];
            }
            result.push([...p]);
        }
        return result;
    }





    /**
     * 获取贝塞尔点集
     *
     * @static
     * @param {*} points
     * @param {*} count
     * @return {*} 
     * @memberof MathUtil
     */
    static BesselPoints(points, count) {
        const n = points.length - 1;
        const nf = this.Factorial(n);
        let p, step, A, result = [];
        step = 1 / count;
        for (let t = 0; t < 1; t += step) {
            p = [0, 0];
            if (points[0].length > 2) p.push(0);

            for (let i = 0; i <= n; i++) {
                A = nf / (this.Factorial(i) * this.Factorial(n - i));
                for (let j = 0; j < p.length; j++) {
                    p[j] += (points[i][j] * Math.pow(1 - t, n - i) * Math.pow(t, i) * A);
                }
            }
            result.push([...p]);
        }
        return result;
    }
}

export { MathUtil }
