import React, { Component } from 'react';

class Main extends Component {
    render() {
        return (
            <div id="content">
                <h1>Add Product</h1>
                <form onSubmit={(event) => {
                    event.preventDefault()
                    const name = this.productName.value
                    const price = window.web3.utils.toWei(this.productPrice.value.toString(), 'Ether')
                    this.props.createProduct(name, price)
                }}>
                    <div className="mb-3">
                        <input
                            id="productName"
                            type="text"
                            ref={(input) => { this.productName = input }}
                            className="form-control"
                            placeholder="Product Name"
                            required />
                    </div>
                    <div className="mb-3">
                        <input
                            id="productPrice"
                            type="text"
                            ref={(input) => { this.productPrice = input }}
                            className="form-control"
                            placeholder="Product Price"
                            required />
                    </div>
                    <button type="submit" className="mb-3 btn btn-primary">Add Product</button>
                </form>
                <p> </p>
                <h2>Buy Product</h2>
                <table className="table">
                    <thead>
                        <tr>
                            <th scope="col">#</th>
                            <th scope="col">Name</th>
                            <th scope="col">Price</th>
                            <th scope="col">Owner</th>
                            <th scope="col"></th>
                        </tr>
                    </thead>
                    <tbody id="productList">
                        {this.props.products.map(product =>
                            <tr key={product.id.toString()}>
                                <th scope="row">{product.id.toString()}</th>
                                <td>{product.name}</td>
                                <td>{window.web3.utils.fromWei(product.price, 'Ether')} ETH</td>
                                <td>{product.owner}</td>
                                {!product.purchased && product.owner != this.props.account && <td><button className="buyButton"
                                    onClick={(event) => {
                                        event.preventDefault()
                                        this.props.purchaseProduct(window.web3.utils.toBN(product.id), window.web3.utils.toBN(product.price))
                                    }}>Buy</button></td>}
                            </tr>
                        )
                        }
                    </tbody>
                </table>
            </div>
        );
    }
} export default Main;
