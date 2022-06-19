import React, { Component } from 'react';
import Web3 from 'web3';
// import logo from '../logo.png';
import './App.css';
import Marketplace from '../abis/Marketplace.json';
import Navbar from './Navbar';
import Main from './Main';


class App extends Component {

    async componentWillMount() {
        await this.loadWeb3();
        await this.loadBlockchainData();
    }

    async loadWeb3() {
        if (window.ethereum) {
            window.web3 = new Web3(window.ethereum);
            await window.ethereum.enable();
        }
        else if (window.web3) {
            window.web3 = new Web3(window.web3.currentProvider);
        }
        else {
            window.alert('Non-Ethereum browser detected. You should consider trying MetaMask!');
        }
    }

    async loadBlockchainData() {
        const web3 = window.web3;
        // Load account
        const accounts = await web3.eth.getAccounts();
        console.log(accounts);
        const currentAccount = accounts[0];
        this.setState({ account: currentAccount });
        const networkId = await web3.eth.net.getId();
        console.log(networkId);
        const networkData = Marketplace.networks[networkId];
        console.log(networkData);
        if (networkData) {
            const marketplace = new web3.eth.Contract(Marketplace.abi, networkData.address);
            console.log(marketplace);
            this.setState({ marketplace });
            this.loadProducts();
            this.setState({ loading: false });
        } else {
            window.alert('Marketplace contract not deployed to detected network.');
        }
    }

    constructor(props) {
        super(props);

        this.state = {
            account: '',
            productCount: 0,
            products: [],
            loading: true
        };

        this.createProduct = this.createProduct.bind(this);
        this.purchaseProduct = this.purchaseProduct.bind(this);
        this.loadProducts = this.loadProducts.bind(this);
    }

    async loadProducts() {
        // this.setState({ loading: true });
        // const productCount = await this.state.marketplace.methods.productCount().call();
        // console.log(productCount);
        // const products = [];
        // for (let i = 1; i <= productCount; i++) {
        //     const product = await this.state.marketplace.methods.products(i).call();
        //     console.log(product);
        //     products.push(product);
        // }
        // this.setState({ products });
        // this.setState({ loading: false });
    }

    createProduct(name, price) {
        console.log("Creating product: " + name + ", price: " + price);
        this.setState({ loading: true });
        this.state.marketplace.methods.createProduct(name, price).send({ from: this.state.account, value: price })
            .once('receipt', (receipt) => {
                this.loadProducts();
            })
    }

    purchaseProduct(id, price) {
        console.log("Puchasing: " + id + ", price: " + price);
        this.setState({ loading: true });
        this.state.marketplace.methods.purchaseProduct(id).send({ from: this.state.account, value: price })
            .once('receipt', (receipt) => {
                this.loadProducts();
            })
    }

    render() {
        console.log(this.state)
        return (
            <div>
                <Navbar account={this.state.account} />
                <div className="container-fluid mt-5">
                    <div className="row">
                        <main role="main" className="col-lg-12 d-flex">
                            {this.state.loading
                                ? <div id="loader" className="text-center"><p className="text-center">Loading...</p></div>
                                : <Main createProduct={this.createProduct} purchaseProduct={this.purchaseProduct} products={this.state.products} />
                            }
                        </main>
                    </div>
                </div>
            </div>
        );
    }
}

export default App;
