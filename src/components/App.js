import React, { Component } from 'react';
import Web3 from 'web3';
// import logo from '../logo.png';
import './App.css';
import Navbar from './Navbar';
import Main from './Main';
import contract from '@truffle/contract';
import MarketPlaceArtifact from '../abis/Marketplace.json';

class App extends Component {

    async componentWillMount() {
        await this.loadWeb3();
        await this.loadBlockchainData();
    }

    async loadWeb3() {
        // Modern dapp browsers...
        if (window.ethereum) {
            App.web3Provider = window.ethereum;
            try {
                // Request account access
                await window.ethereum.enable();
            } catch (error) {
                // User denied account access...
                console.error("User denied account access")
            }
        }
        // Legacy dapp browsers...
        else if (window.web3) {
            App.web3Provider = window.web3.currentProvider;
        }
        // If no injected web3 instance is detected, fall back to Ganache
        else {
            App.web3Provider = new Web3.providers.HttpProvider('http://localhost:8545');
        }
        window.web3 = new Web3(App.web3Provider);
    }

    async loadBlockchainData() {
        const Marketplace = contract(MarketPlaceArtifact);
        Marketplace.setProvider(App.web3Provider);
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
            const marketplace = await Marketplace.at(networkData.address);
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
        this.setState({ loading: true });
        const productCount = await this.state.marketplace.productCount();
        console.log(productCount);
        const products = [];
        for (let i = 1; i <= productCount; i++) {
            const product = await this.state.marketplace.products(i);
            console.log(product);
            products.push(product);
        }
        this.setState({ products });
        this.setState({ loading: false });
    }

    createProduct(name, price) {
        console.log("Creating product: " + name + ", price: " + price);
        this.setState({ loading: true });
        this.state.marketplace.createProduct(name, price, { from: this.state.account })
            .once('receipt', (receipt) => {
                this.loadProducts();
            })
    }

    purchaseProduct(id, price) {
        console.log("Puchasing: " + id + ", price: " + price);
        this.setState({ loading: true });
        this.state.marketplace.purchaseProduct(id, { from: this.state.account, value: price })
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
                                : <Main account={this.state.account} createProduct={this.createProduct} purchaseProduct={this.purchaseProduct} products={this.state.products} />
                            }
                        </main>
                    </div>
                </div>
            </div>
        );
    }
}

export default App;
