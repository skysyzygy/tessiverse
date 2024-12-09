import { User } from "$lib/user";
import { test, expect, describe, vi } from "vitest";
import { SecretClient } from "@azure/keyvault-secrets"
import { Azure } from "$lib/azure";
import * as config from '$lib/config'

describe("UserConfig", () => {
    let user = new User("me@test.com")
    test("UserConfig constructor can hold app config and returns auth info", () => {
        expect(user).toHaveProperty("apps")
        Object.assign(user.apps.tessitura, {userid: "me", group: "group", location: "location"})
        expect(user.apps.tessitura.auth).toBe(config.servers[0].value + "|me|group|location")
    })

    test("loadFromAzure throws error if data does not exist in Azure", async () => {
        let azure = new Azure()
        let user1 = azure.load({identity:"not_me@test.com"}, new User(""))
        await expect(user1).rejects.toMatchObject({status: 404})

        let user2 = new User("not_me@test.com")
        await expect(user2.load()).rejects.toMatchObject({status: 404})
    })

    test("saveToAzure creates a new secret", async () => {
        await expect(user.save()).resolves.not.toThrowError()
    })

    test("loadFromAzure returns a matching secret", async () => {
        let user2 = new User("me@test.com")
        await expect(user2.load()).resolves.toEqual(JSON.parse(JSON.stringify(user)))
    })

    test("loadFromAzure throws error if secret does not match identity", async () => {
        SecretClient.prototype.getSecret = vi.fn(async () => 
             {return {
                properties: {
                    tags: {identity: "bad_user@test.com"},
                    vaultUrl: "",   
                    name: ""         
                },
                name: ""
            }})
        const consoleSpy = vi.spyOn(console, 'log')
        await expect(user.load()).rejects.toMatchObject({status: 500, body: {message: "Hash collision PANIC!"}})
        expect(consoleSpy).toHaveBeenCalled()
        expect(consoleSpy.mock.calls[0].toString()).toMatch(/Hash collision/)
    })


})