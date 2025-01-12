import { SlashCommandBuilder } from "@discordjs/builders";
import { AutocompleteInteraction, Collection, CommandInteraction, MessageEmbed } from "discord.js";
import type { Recipe, RecipeFile, SlashCommand } from "src/@types";
import * as normal from '../recipes/normal';
import * as mobile from '../recipes/mobile';
import * as pizza from '../recipes/pizza';
import * as cac from '../recipes/cac';

export const recipe: SlashCommand['recipe'] = new SlashCommandBuilder()
    .setName('recipe')
    .setDescription('Shows a random recipe of the game that you can make!')
    .addSubcommand(sub => {
        sub.setName('random');
        sub.setDescription('Shows a random recipe of the game that you can make!');
        sub.addStringOption(option => {
            option.setName('gamemode')
            option.setDescription('The gamemode you want a recipe of')
            option.addChoices([
                ['Normal (Default)', 'normal'],
                ['Mobile', 'mobile'],
                ['Cakes and Cookies', 'cac'],
                ['Pizza', 'pizza']
            ]);
            return option;
        });
        return sub;
    })
    .addSubcommand(sub => {
        sub.setName('get');
        sub.setDescription('Shows a specific recipe that you can make!');
        sub.addStringOption(option => {
            option.setName('recipe');
            option.setDescription('The recipe you want to see');
            option.setRequired(true);
            option.autocomplete = true;
            return option;
        });
        return sub;
    });

export const cook: SlashCommand['cook'] = async (interaction: CommandInteraction | AutocompleteInteraction): Promise<void> => {
    if (interaction.isAutocomplete()) {
        const recipes = new Collection<string, Recipe>();
        normal.getAll().each(recipe => recipes.set(recipe.name, recipe));
        mobile.getAll().each(recipe => recipes.set(recipe.name, recipe));
        cac.getAll().each(recipe => recipes.set(recipe.name, recipe));
        pizza.getAll().each(recipe => recipes.set(recipe.name, recipe));
        const filtered = recipes.filter(recipe => recipe.name.toLowerCase().startsWith(interaction.options.getFocused() + ''));
        return interaction.respond(filtered.map(recipe => ({ name: recipe.name, value: recipe.name })));
    }
    
    await interaction.deferReply();

    const gamemode = interaction.options.getString('gamemode') || 'normal';
    const recipe = ((await import(`../recipes/${gamemode}`)) as RecipeFile).getRandom();

    const embed = new MessageEmbed()
        .setTitle(recipe.name)
        .setDescription(recipe.text)
        .setThumbnail(recipe.image || '');

    setTimeout(() => {
        interaction.editReply({ embeds: [embed] });
    }, 3000);
}