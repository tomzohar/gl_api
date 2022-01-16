"use strict";

const UserModel = require("./../models/user.model");
const StatusCodes = require("../models/StatusCodes");
const ListModel = require("../models/list.model");

const ListController = {};

ListController.GetAllUsersLists = async (req, res) => {
    try {
        const user = await UserModel.findOne({ _id: req.body.sUserID });
        if (!user)
            return res.status(StatusCodes.BadRequest).json({ error: true });
        const lists = await ListModel.find();
        const userLists = lists.filter(list => user.aListsIDs.includes(list._id));
        return res.status(200).json({
            data: userLists
        });
    }
    catch (error) {
        return res.status(404).json({
            error: true,
            message: 'Not Found'
        });
    }
};
ListController.AddList = async (req, res) => {
    try {
        const { list, sUserID } = req.body;
        const newList = new ListModel(list);
        await newList.save();
        const user = await UserModel.findOne({ _id: sUserID });
        user.aListsIDs.push(newList._id);
        await user.save();
        return res.status(StatusCodes.OK).json({
            data: { list: newList, user: user }
        });
    }
    catch (error) {
        return res.status(StatusCodes.ServerError).json({
            error: true,
            message: 'Could not add list'
        });
    }
};
ListController.Update = async (req, res) => {
    console.log(req.body);
    return res.status(200).json({
        data: []
    });
};
ListController.AddItemToList = async (req, res) => {
    try {
        const item = req.body;
        item.dCreated = new Date();
        const list = await ListModel.findOne({ _id: item.sListID });
        if (list) {
            list.dLastUpdated = new Date();
            list.items.push(item);
            await list.save();
        }
        return res.status(200).json({
            data: list
        });
    }
    catch (err) {
        return res.status(StatusCodes.StatusCodes.ServerError).json({
            error: true,
            messge: 'Could not add item'
        });
    }
};
ListController.RemoveItemFromList = async (req, res) => {
    try {
        const { sListID, items } = req.body;
        if (items.length < 1) {
            return res.status(StatusCodes.BadRequest).json({ error: true });
        }
        const list = await ListModel.findOne({ _id: sListID });
        items.forEach(async (item) => {
            try {
                if (list) {
                    list.items = list.items.filter(i => i._id.toString() !== item._id);
                    await list.save();
                }
            }
            catch (error) {
                return res.status(StatusCodes.NotFound).json({
                    error: true,
                    message: 'Could not delete item'
                });
            }
        });
        return res.status(StatusCodes.OK).json({ data: list });
    }
    catch (error) {
        return res.status(StatusCodes.ServerError).json({ error: true });
    }
};

module.exports = ListController;